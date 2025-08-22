# backend/cleanup.py
from services.mongo_client import db

def cleanup_predictions():
    result = db.predictions.delete_many({})
    print(f"✅ Deleted {result.deleted_count} documents from 'predictions' collection")

if __name__ == "__main__":
    cleanup_predictions()
