# backend/db.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the MongoDB URI from the environment
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in the .env file!")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["KrishiMitra"]  # Database name

print("✅ Connected to MongoDB!")

