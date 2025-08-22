# backend/routes/crops_route.py
from flask import Blueprint, jsonify, request
from services.mongo_client import db

bp = Blueprint('crops', __name__, url_prefix='/api')

@bp.route('/crops', methods=['GET'])
def crops():
    state = request.args.get('state','').strip()
    district = request.args.get('district','').strip()
    if state and district:
        rec = db.top_crops.find_one({"state":state,"district":district})
        if rec:
            return jsonify({"crops": rec['top_crops']})
    # fallback: union of top crops
    cursor = db.top_crops.find({})
    s = set()
    for r in cursor:
        s.update(r.get('top_crops',[]))
    return jsonify({"crops": sorted(list(s))})
