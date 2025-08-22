# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB connection
from services.mongo_client import db

# JWT
from flask_jwt_extended import JWTManager
app.config["JWT_SECRET_KEY"] = "9f8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c"  # replace with strong random key
jwt = JWTManager(app)

# ---------------- Blueprints ----------------
from routes.auth_route import auth_bp
from routes.crops_route import bp as crops_bp
from routes.predict_route import bp as predict_bp
from routes.ingest_route import bp as ingest_bp
from routes.train_route import bp as train_bp
from routes.market_route import bp as market_bp # ✅ NEW
from routes.chatbot_route import chatbot_bp

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(crops_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(ingest_bp)
app.register_blueprint(train_bp)
app.register_blueprint(market_bp)   # ✅ NEW
app.register_blueprint(chatbot_bp)   # ✅ NEW

# ---------------- Core Endpoints ----------------
@app.route('/')
def index():
    return jsonify({"status": "KrishiMitra backend running"})

# List all states present in DB
@app.route("/api/states", methods=["GET"])
def list_states():
    try:
        states = sorted([s for s in db.crops.distinct("state") if s and isinstance(s, str)])
        return jsonify({"states": states})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# List districts for a given state
@app.route("/api/districts", methods=["GET"])
def list_districts():
    state = request.args.get("state", "").strip()
    if not state:
        return jsonify({"error": "Missing 'state' query param"}), 400
    try:
        districts = sorted(
            [d for d in db.crops.distinct("district", {"state": state}) if d and isinstance(d, str)]
        )
        return jsonify({"state": state, "districts": districts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# List crops for a given state + district
@app.route("/api/crops", methods=["GET"])
def list_crops():
    state = request.args.get("state", "").strip()
    district = request.args.get("district", "").strip()

    if not state or not district:
        return jsonify({"error": "Missing 'state' or 'district'"}), 400

    try:
        crops = sorted(
            [
                c
                for c in db.crops.distinct(
                    "commodity", {"state": state, "district": district}
                )
                if c and isinstance(c, str)
            ]
        )
        return jsonify({"state": state, "district": district, "crops": crops})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health():
    try:
        db.crops.estimated_document_count()
        return jsonify({"status": "ok", "time": datetime.utcnow().isoformat() + "Z"})
    except Exception as e:
        return jsonify({"status": "degraded", "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
