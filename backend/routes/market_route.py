# backend/routes/market_route.py
from flask import Blueprint, request, jsonify
from services.mongo_client import db
import time

bp = Blueprint("market", __name__, url_prefix="/api/market")

# Temporary in-memory store of active sell intents
active_farmers = []
EXPIRY_SECONDS = 300  # 5 minutes


@bp.route("/sell-intent", methods=["POST"])
def sell_intent():
    """
    Farmer posts their intent (district, crop, name, contact, email, price).
    Return list of matching dealers immediately (dealers whose districtPreferences include farmer's district).
    """
    data = request.json or {}

    district = data.get("district")
    crop = data.get("crop")
    farmer_name = data.get("name")
    farmer_contact = data.get("contact")
    farmer_email = data.get("email")
    state = data.get("state")
    price = data.get("price")

    if not district or not crop:
        return jsonify({"error": "District and crop are required"}), 400

    # Store farmer intent in memory (not DB) with timestamp
    farmer_entry = {
        "name": farmer_name,
        "contact": farmer_contact,
        "email": farmer_email,
        "state": state,
        "district": district,
        "crop": crop,
        "price": price,
        "timestamp": time.time(),  # ✅ store post time
    }
    active_farmers.append(farmer_entry)

    # Cleanup expired farmers
    _cleanup_expired()

    # Find all dealers who are interested in this district (using districtPreferences)
    dealers = list(
        db.users.find(
            {"role": "dealer", "districtPreferences": {"$in": [district]}},
            {"password": 0, "_id": 0}  # exclude sensitive fields
        )
    )

    return jsonify({"dealers": dealers})


@bp.route("/dealer-view/<dealer_email>", methods=["GET"])
def dealer_view(dealer_email):
    """
    Dealer pulls all active farmers whose district is in dealer's districtPreferences.
    Expired requests (older than 5 minutes) are automatically removed.
    """
    dealer = db.users.find_one({"role": "dealer", "email": dealer_email})
    if not dealer:
        return jsonify({"error": "Dealer not found"}), 404

    # Cleanup expired farmers
    _cleanup_expired()

    preferred_districts = dealer.get("districtPreferences", [])
    now = time.time()

    matching_farmers = []
    for f in active_farmers:
        if f.get("district") in preferred_districts:
            minutes_ago = int((now - f["timestamp"]) // 60)
            if minutes_ago == 0:
                posted = "Just now"
            else:
                posted = f"Posted {minutes_ago} min ago"

            f_copy = f.copy()
            f_copy["posted"] = posted  # ✅ add freshness info
            matching_farmers.append(f_copy)

    return jsonify({"farmers": matching_farmers})


def _cleanup_expired():
    """Remove farmer entries older than EXPIRY_SECONDS (5 minutes)."""
    global active_farmers
    now = time.time()
    active_farmers = [
        f for f in active_farmers if now - f["timestamp"] <= EXPIRY_SECONDS
    ]
