# backend/services/train_service.py
import os, json, joblib, yaml
from pathlib import Path
import numpy as np
import pandas as pd

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.metrics import mean_squared_error
from services.mongo_client import db
from services.preprocess_service import load_series_from_docs, create_sequences, scale_series
from config import MODELS_DIR, SEQ_LEN, PRED_HORIZON, EPOCHS, BATCH_SIZE

Path(MODELS_DIR).mkdir(parents=True, exist_ok=True)

def build_model(seq_len=SEQ_LEN, horizon=PRED_HORIZON):
    model = Sequential()
    model.add(LSTM(128, input_shape=(seq_len,1), return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(horizon))
    model.compile(optimizer='adam', loss='mse')
    return model

def train_state_crop(state, crop):
    # fetch all docs for this state & crop (pool districts)
    cursor = db.crops.find({"state":state, "commodity": {"$regex": f"^{crop}$", "$options":"i"}}, {"date":1,"price":1})
    docs = list(cursor)
    if not docs:
        print("No docs for", state, crop)
        return None
    # group by date (some markets repeat dates) -> average price per date
    df = {}
    for d in docs:
        key = d['date']
        df.setdefault(key, []).append(d['price'])
    series_docs = [{"date":k, "price": float(sum(v)/len(v))} for k,v in df.items()]
    series = load_series_from_docs(series_docs)
    if len(series) < SEQ_LEN + PRED_HORIZON + 10:
        print("Insufficient series length for", state, crop, len(series))
        return None
    scaled, scaler = scale_series(series, None, save_path=os.path.join(MODELS_DIR, f"{state}__{crop}__scaler.pkl"))
    X, y = create_sequences(pd.Series(scaled), seq_len=SEQ_LEN, horizon=PRED_HORIZON)
    if X.shape[0] < 50:
        print("Not enough sequences for", state, crop)
        return None
    model = build_model()
    mpath = os.path.join(MODELS_DIR, f"{state}__{crop}__model.h5")
    cb = [EarlyStopping(patience=6, restore_best_weights=True), ModelCheckpoint(mpath, save_best_only=True, monitor='loss')]
    model.fit(X, y, epochs=EPOCHS, batch_size=BATCH_SIZE, callbacks=cb, verbose=1)
    # evaluate
    split = int(0.9 * len(X))
    ypred = model.predict(X[split:])
    ytrue = y[split:]
    try:
        ypred_inv = scaler.inverse_transform(ypred.reshape(-1,1)).reshape(ypred.shape)
        ytrue_inv = scaler.inverse_transform(ytrue.reshape(-1,1)).reshape(ytrue.shape)
    except Exception:
        ypred_inv, ytrue_inv = ypred, ytrue
    rmse = float(np.sqrt(mean_squared_error(ytrue_inv.flatten(), ypred_inv.flatten())))
    mape = float(np.mean(np.abs((ytrue_inv.flatten() - ypred_inv.flatten())/(ytrue_inv.flatten()+1e-9))) * 100)
    meta = {"state":state,"crop":crop,"rmse":rmse,"mape":mape}
    db.models_meta.update_one({"state":state,"crop":crop},{"$set":meta}, upsert=True)
    print("Saved model for", state, crop, "RMSE:", rmse, "MAPE:", mape)
    return meta
