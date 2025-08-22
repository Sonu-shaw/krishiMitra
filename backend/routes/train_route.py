# backend/routes/train_route.py
from flask import Blueprint, request, jsonify
from services.train_service import train_state_crop

bp = Blueprint('train', __name__, url_prefix='/api')

@bp.route('/train', methods=['POST'])
def train():
    body = request.get_json() or {}
    state = body.get('state')
    crop = body.get('crop')
    if not state or not crop:
        return jsonify({"error":"state and crop required (JSON body)"}), 400
    meta = train_state_crop(state, crop)
    if meta:
        return jsonify({"status":"trained","meta":meta})
    return jsonify({"status":"failed"}), 500
