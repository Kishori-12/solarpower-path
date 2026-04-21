from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user_model import find_user_by_id, public_user

user_bp = Blueprint("user", __name__)


@user_bp.route("/user-data", methods=["GET"])
@jwt_required()
def user_data():
    user_id = int(get_jwt_identity())
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"success": True, "data": public_user(user)}), 200


@user_bp.route("/user-data", methods=["PUT"])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    # Only allow updating name and phone
    if "name" in data:
        user["name"] = data["name"]
    if "phone" in data:
        user["phone"] = data.get("phone")

    return jsonify({"success": True, "data": public_user(user)}), 200
