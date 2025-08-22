import requests
import json

BASE_URL = "http://localhost:5000/api"

STATE = "Bihar"
DISTRICT = "Muzaffarpur"  # optional
CROP = "Mustard"

def run_ingest():
    print("\n📥 Running Data Ingestion...")
    r = requests.post(f"{BASE_URL}/ingest")
    print("Response:", r.json())

def run_train():
    print(f"\n🤖 Training model for {STATE} - {CROP}...")
    payload = {"state": STATE, "crop": CROP}
    r = requests.post(f"{BASE_URL}/train", json=payload)
    print("Response:", r.json())

def run_predict():
    print(f"\n📊 Getting predictions for {STATE} - {DISTRICT} - {CROP}...")
    params = {"state": STATE, "district": DISTRICT, "crop": CROP}
    r = requests.get(f"{BASE_URL}/predict", params=params)
    data = r.json()
    if "predictions" in data:
        print("\nPredicted Prices:")
        for p in data["predictions"]:
            print(f"  {p['date']}: ₹{p['price']}")
    else:
        print("Error:", data)

if __name__ == "__main__":
    # Run steps in order
    run_ingest()
    run_train()
    run_predict()
