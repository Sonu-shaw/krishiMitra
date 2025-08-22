# backend/services/predict_service.py
import os, joblib, numpy as np, datetime
import pandas as pd
from services.mongo_client import db
from tensorflow.keras.models import load_model
from config import MODELS_DIR, SEQ_LEN, PRED_HORIZON


def _parse_target_date(as_of_date_str):
    """
    Accepts:
      - 'YYYY-MM-DD' (ISO)
      - 'DD/MM/YYYY'
      - 'DD-MM-YYYY'
      - 'MM/DD/YYYY' (last resort)
    Returns date or raises ValueError.
    """
    if as_of_date_str is None:
        return None
    if isinstance(as_of_date_str, datetime.date):
        return as_of_date_str

    s = str(as_of_date_str).strip()
    try:
        return datetime.date.fromisoformat(s)
    except Exception:
        pass

    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.datetime.strptime(s, fmt).date()
        except Exception:
            continue

    raise ValueError(f"Invalid as_of_date format: {as_of_date_str}")


def predict_state_crop(state, district, crop, as_of_date=None):
    """
    On-demand prediction (no DB write).
    Forecast window is aligned to the end of historical data so results are consistent across runs.

    Behavior:
    - Let hist_end = last date present in the historical series.
    - We recursively forecast day-by-day from (hist_end + 1) forward.
    - If as_of_date is None => start graph from (hist_end + 1).
      Else => start graph from max(as_of_date, hist_end + 1).
    - We return exactly PRED_HORIZON days starting from that start date (inclusive).

    This ensures that the price you see for, say, 21/08 in a run on 18/08
    will match the price returned when you run directly for 21/08 (assuming history unchanged).
    """

    # --- 1) Load historical docs (prefer district, else pool state) ---
    query = {"state": state, "commodity": {"$regex": f"^{crop}$", "$options": "i"}}
    if district:
        query["district"] = district

    docs = list(db.crops.find(query, {"date": 1, "price": 1}))
    if not docs:
        docs = list(
            db.crops.find(
                {"state": state, "commodity": {"$regex": f"^{crop}$", "$options": "i"}},
                {"date": 1, "price": 1},
            )
        )
        if not docs:
            return {"error": "no data"}

    # --- 2) Aggregate by date & build dense daily series ---
    # If multiple entries per date, average them.
    date_map = {}
    for d in docs:
        date_map.setdefault(d["date"], []).append(d["price"])
    series_docs = [{"date": k, "price": float(sum(v) / len(v))} for k, v in date_map.items()]
    series_docs = sorted(series_docs, key=lambda x: x["date"])

    s = pd.DataFrame(series_docs)
    s["date"] = pd.to_datetime(s["date"])
    s = s.set_index("date").resample("D").mean()
    s["price"] = s["price"].interpolate(limit_direction="both")

    if len(s) < SEQ_LEN:
        return {"error": "insufficient history"}

    # The true anchor for forecasting is the LAST historical date we have:
    hist_end = s.index.max().date()

    # --- 3) Load model & scaler ---
    model_path = os.path.join(MODELS_DIR, f"{state}__{crop}__model.h5")
    scaler_path = os.path.join(MODELS_DIR, f"{state}__{crop}__scaler.pkl")
    if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
        return {"error": "no trained model for this state/crop"}

    scaler = joblib.load(scaler_path)
    model = load_model(model_path)

    # --- 4) Scale historical series & seed the sequence ---
    arr = s["price"].values.astype(float)
    scaled_hist = scaler.transform(arr.reshape(-1, 1)).flatten().tolist()
    seq = scaled_hist[-SEQ_LEN:].copy()

    # --- 5) Decide forecast start date (inclusive) ---
    try:
        wanted = _parse_target_date(as_of_date) if as_of_date else None
    except ValueError as e:
        return {"error": str(e)}

    # First possible forecasted day is hist_end + 1
    first_forecast_day = hist_end + datetime.timedelta(days=1)

    # If no as_of_date, start at first_forecast_day.
    # If as_of_date < first_forecast_day, we cannot predict "into history";
    # so we clamp to first_forecast_day to avoid lying about dates.
    start_date = wanted if wanted else first_forecast_day
    if start_date < first_forecast_day:
        start_date = first_forecast_day

    # How many recursive steps we need to generate in total?
    # We must generate all days from (hist_end + 1) up to (start_date + PRED_HORIZON - 1).
    total_days_needed = (start_date - first_forecast_day).days + PRED_HORIZON
    if total_days_needed <= 0:
        # Extremely unlikely with the clamping above, but guard anyway
        total_days_needed = PRED_HORIZON

    # --- 6) Generate the entire forward path once ---
    forward_all = []  # list of {"date": iso, "price": float}
    for i in range(total_days_needed):
        X = np.array(seq[-SEQ_LEN:]).reshape(1, SEQ_LEN, 1)
        next_scaled = model.predict(X, verbose=0)[0][0]
        seq.append(next_scaled)

        price = float(scaler.inverse_transform([[next_scaled]])[0][0])
        d = first_forecast_day + datetime.timedelta(days=i)
        forward_all.append({"date": d.isoformat(), "price": round(price, 2)})

    # Extract the window that starts at start_date (inclusive)
    start_idx = (start_date - first_forecast_day).days
    window = forward_all[start_idx : start_idx + PRED_HORIZON]

    # --- Debug prints to verify alignment in your logs ---
    print(
        f"[predict_service] hist_end={hist_end} first_forecast_day={first_forecast_day} "
        f"wanted={wanted} start_date={start_date} total_days_needed={total_days_needed} "
        f"start_idx={start_idx} horizon={PRED_HORIZON}"
    )

    # --- 7) Return result (NO DB storage) ---
    return {
        "state": state,
        "district": district,
        "crop": crop,
        "as_of_date": start_date.isoformat(),
        "target_price": window[0]["price"],   # price for the selected as_of_date
        "predictions": window,                # PRED_HORIZON days starting at as_of_date
    }
