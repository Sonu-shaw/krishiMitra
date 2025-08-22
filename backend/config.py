# backend/config.py
import os

MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGODB_DB", "krishimitra")
DATA_YEARS = int(os.environ.get("KM_YEARS", 4))

# Model / training hyperparams
SEQ_LEN = int(os.environ.get("KM_SEQ_LEN", 28))
PRED_HORIZON = int(os.environ.get("KM_PRED_HORIZON", 7))
EPOCHS = int(os.environ.get("KM_EPOCHS", 40))
BATCH_SIZE = int(os.environ.get("KM_BATCH", 64))

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")
CLEAN_DIR = os.path.join(DATA_DIR, "cleaned")
TOPCROPS_JSON = os.path.join(DATA_DIR, "top_crops_by_district.json")

# Agmarknet bulk URL (update if needed)
AGMARKNET_BULK_URL = os.environ.get("AGMARKNET_BULK_URL",
    "https://data.gov.in/sites/default/files/commodity_daily_prices_agmarknet.csv")
