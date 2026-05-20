from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.cleaner_auth_service import register_cleaner, login_cleaner
from models.cleaner_model import get_all_cleaners, public_cleaner, find_cleaner_by_id

cleaner_bp = Blueprint("cleaner", __name__, url_prefix="/cleaner")

@cleaner_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data: return jsonify({"error": "Request body required"}), 400
    res, err = register_cleaner(data)
    if err: return jsonify({"error": err}), 400
    return jsonify({"success": True, "data": res}), 201

@cleaner_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    res, err = login_cleaner(data.get("email"), data.get("password"))
    if err: return jsonify({"error": err}), 401
    return jsonify({"success": True, "data": res}), 200

@cleaner_bp.route("/list", methods=["GET"])
def list_cleaners():
    cleaners = get_all_cleaners()
    pub = [public_cleaner(c) for c in cleaners]
    return jsonify({"success": True, "data": pub}), 200

@cleaner_bp.route("/upload-documents", methods=["POST"])
@jwt_required()
def upload_documents():
    try:
        identity = get_jwt_identity() # "cleaner:<id>"
        if not identity or not identity.startswith("cleaner:"):
            return jsonify({"error": "Unauthorized"}), 401
        
        c_id = identity.split(":", 1)[1]
        
        # We simulate the upload process and set to under_review for admin approval
        import time
        time.sleep(1)
        
        from models.cleaner_model import update_cleaner_status
        update_cleaner_status(c_id, False, "under_review")
        
        # Fetch updated cleaner
        updated = find_cleaner_by_id(c_id)
        
        return jsonify({"success": True, "message": "Documents uploaded successfully. Pending admin approval.", "data": public_cleaner(updated)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
