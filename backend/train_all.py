# backend/train_all.py
from services.mongo_client import db
import requests

# URL of your backend training endpoint
TRAIN_URL = "http://127.0.0.1:5000/api/train"

def get_all_state_crop_pairs():
    # Get all unique (state, crop) pairs from DB
    pipeline = [
        {"$group": {"_id": {"state": "$state", "commodity": "$commodity"}}}
    ]
    results = db.crops.aggregate(pipeline)
    return [(r["_id"]["state"], r["_id"]["commodity"]) for r in results]

def main():
    pairs = get_all_state_crop_pairs()
    print(f"Found {len(pairs)} state–crop pairs to train.")

    for state, crop in pairs:
        print(f"🚀 Training for {state} – {crop}...")
        resp = requests.post(TRAIN_URL, json={"state": state, "crop": crop})
        try:
            print("✅", resp.json())
        except Exception:
            print("❌ Training failed:", resp.text)

if __name__ == "__main__":
    main()
