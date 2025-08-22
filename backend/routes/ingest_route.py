# backend/routes/ingest_route.py
from flask import Blueprint, jsonify
from services.ingest_service import run_full_ingest

bp = Blueprint('ingest', __name__, url_prefix='/api')

@bp.route('/ingest', methods=['POST'])
def ingest():
    try:
        ok = run_full_ingest()
        return jsonify({"status":"ok"}) if ok else (jsonify({"status":"failed"}), 500)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
