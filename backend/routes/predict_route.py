# backend/routes/predict_route.py
from flask import Blueprint, jsonify, request
from services.predict_service import predict_state_crop

bp = Blueprint('predict', __name__, url_prefix='/api')

@bp.route('/predict', methods=['GET'])
def predict():
    state = request.args.get('state')
    district = request.args.get('district','')
    crop = request.args.get('crop')
    date = request.args.get('date')  # optional
    if not state or not crop:
        return jsonify({"error":"state and crop required"}), 400
    res = predict_state_crop(state, district, crop, as_of_date=date)
    return jsonify(res)
