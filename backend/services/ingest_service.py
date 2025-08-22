# backend/services/ingest_service.py
import os, json
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from config import DATA_DIR, DATA_YEARS
from services.mongo_client import db

Path(DATA_DIR).mkdir(parents=True, exist_ok=True)

def date_range_years(years):
    end = datetime.utcnow().date()
    start = end - timedelta(days=365 * years)
    return start, end

def clean_and_insert(csv_path):
    print(f"📂 Loading CSV: {csv_path}")
    
    # Read CSV
    df = pd.read_csv(csv_path)

    # Strip spaces from headers just in case
    df.columns = df.columns.str.strip()
    print("📑 CSV Columns detected:", df.columns.tolist())

    # Rename columns to match internal usage
    df = df.rename(columns={
    'State': 'State',              # already matches
    'District': 'District',
    'Crop': 'Commodity',
    'Price': 'Modal Price',        # ✅ use "Price" instead of "Model Price(in Quintal)"
    'Date': 'Date'
    })

    # Convert Date from string to datetime
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')

    # Keep only relevant columns (drop Sl no)
    df = df[['Date', 'State', 'District', 'Commodity', 'Modal Price']]

    print("Initial rows:", len(df))

    # Drop rows with missing required fields
    df = df.dropna(subset=['Date', 'State', 'District', 'Commodity', 'Modal Price'])
    print("After dropna:", len(df))

    # Convert prices to numeric
    df['Modal Price'] = pd.to_numeric(df['Modal Price'], errors='coerce')
    df = df.dropna(subset=['Modal Price'])
    print("After numeric conversion:", len(df))

    # Filter by years
    start, end = date_range_years(DATA_YEARS)
    df = df[(df['Date'].dt.date >= start) & (df['Date'].dt.date <= end)]
    print("After date filtering:", len(df))

    if df.empty:
        print("⚠ No data after cleaning. Please check your CSV.")
        return

    # Insert into MongoDB
    docs = []
    for _, row in df.iterrows():
        docs.append({
            "state": str(row['State']).strip(),
            "district": str(row['District']).strip(),
            "commodity": str(row['Commodity']).strip(),
            "date": row['Date'].date().isoformat(),
            "price": float(row['Modal Price'])
        })
        if len(docs) >= 2000:
            db.crops.insert_many(docs)
            docs = []
    if docs:
        db.crops.insert_many(docs)

    print(f"✅ Inserted {len(df)} records into MongoDB collection 'crops'.")


def generate_top_crops():
    pipeline = [
        {"$group": {"_id": {"state": "$state", "district": "$district", "commodity": "$commodity"}, "count": {"$sum": 1}}},
        {"$group": {"_id": {"state": "$_id.state", "district": "$_id.district"}, "crops": {"$push": {"commodity": "$_id.commodity", "count": "$count"}}}}
    ]
    res = db.crops.aggregate(pipeline)
    top_obj = {}
    for r in res:
        st = r['_id']['state']
        dist = r['_id']['district']
        items = sorted(r['crops'], key=lambda x: -int(x['count']))
        top_obj[f"{st}__{dist}"] = [it['commodity'] for it in items[:12]]

    db.top_crops.delete_many({})
    bulk = []
    for k, v in top_obj.items():
        st, dist = k.split("__")
        bulk.append({"state": st, "district": dist, "top_crops": v})
    if bulk:
        db.top_crops.insert_many(bulk)

    Path(DATA_DIR).joinpath("top_crops_by_district.json").write_text(json.dumps(top_obj, indent=2))
    print(f"🏆 Top crops computed and stored in 'top_crops' collection. Found {len(top_obj)} district entries.")


def run_full_ingest():
    local_csv = Path(DATA_DIR) / "Final.csv"
    if not local_csv.exists():
        raise FileNotFoundError(f"{local_csv} not found. Please place Final.csv in backend/data/")
    
    clean_and_insert(local_csv)
    generate_top_crops()
    return True
