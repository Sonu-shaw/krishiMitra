# backend/services/mongo_client.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI not found in environment variables.")

client = MongoClient(MONGO_URI)
db = client.get_database()  # Will use the DB name from your URI

print(f"✅ Connected to MongoDB: {db.name}")