from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from services.auth_service import register_user, login_user
from models.admin_model import find_admin_by_email, public_admin

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    result, error = register_user(data.get("name"), data.get("email"), data.get("password"))
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"success": True, "data": result}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    result, error = login_user(data.get("email"), data.get("password"))
    if error:
        return jsonify({"error": error}), 401
    return jsonify({"success": True, "data": result}), 200


@auth_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    admin = find_admin_by_email(email)
    if not admin or not check_password_hash(admin["password_hash"], password):
        return jsonify({"error": "Invalid admin credentials"}), 401

    token = create_access_token(identity=f"admin:{admin['id']}")
    return jsonify({"success": True, "data": {"admin": public_admin(admin), "token": token}}), 200
