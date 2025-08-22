# backend/routes/auth_route.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from services.mongo_client import db
from bson.objectid import ObjectId

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ---------------- REGISTER ---------------- #
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")
        contact = data.get("contact")
        district_preferences = data.get("districtPreferences", [])

        if not name or not email or not password or not role or not contact:
            return jsonify({"message": "All fields are required"}), 400

        if db.users.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400

        hashed_password = generate_password_hash(password)
        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "contact": contact,
            "districtPreferences": district_preferences
        }

        result = db.users.insert_one(user_doc)
        access_token = create_access_token(identity=str(result.inserted_id))

        return jsonify({
            "_id": str(result.inserted_id),
            "name": name,
            "email": email,
            "role": role,
            "contact": contact,
            "districtPreferences": district_preferences,
            "token": access_token
        }), 201

    except Exception as e:
        return jsonify({"message": "Signup failed", "error": str(e)}), 500


# ---------------- LOGIN ---------------- #
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        user = db.users.find_one({"email": email})
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid email or password"}), 400

        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify({
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "contact": user.get("contact"),
            "districtPreferences": user.get("districtPreferences", []),
            "token": access_token
        })

    except Exception as e:
        return jsonify({"message": "Login failed", "error": str(e)}), 500


# ---------------- CURRENT USER ---------------- #
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    try:
        user_id = get_jwt_identity()
        user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if not user:
            return jsonify({"message": "User not found"}), 404
        user["_id"] = str(user["_id"])
        return jsonify(user)
    except Exception as e:
        return jsonify({"message": "Failed to fetch user", "error": str(e)}), 500


# ---------------- DEALERS LIST ---------------- #
@auth_bp.route("/dealers", methods=["GET"])
def get_dealers():
    """
    Fetch dealers, optionally filtered by state/district.
    Example: /api/auth/dealers?district=Patna
    """
    try:
        state = request.args.get("state")
        district = request.args.get("district")

        query = {"role": "dealer"}
        if district:
            query["districtPreferences"] = {"$in": [district]}
        if state:
            query["districtPreferences"] = {"$in": [district]}  # optional, can expand later

        dealers = list(db.users.find(query, {"password": 0}))
        for d in dealers:
            d["_id"] = str(d["_id"])

        return jsonify(dealers)
    except Exception as e:
        return jsonify({"message": "Failed to fetch dealers", "error": str(e)}), 500
