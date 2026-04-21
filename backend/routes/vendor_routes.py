from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.vendor_auth_service import register_vendor, login_vendor
from services.vendor_upload_service import upload_document, get_vendor_status
from services.vendor_service import get_vendors, recommend_vendors
from models.vendor_model import find_vendor_by_id, update_vendor, public_vendor

vendor_bp = Blueprint("vendor", __name__, url_prefix="/vendor")

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]


def _get_vendor_id():
    identity = get_jwt_identity()          # "vendor:42"
    return int(identity.split(":")[1])


# ── Auth ─────────────────────────────────────────────────
@vendor_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    result, error = register_vendor(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"success": True, "data": result}), 201


@vendor_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    result, error = login_vendor(data.get("email"), data.get("password"))
    if error:
        return jsonify({"error": error}), 401
    return jsonify({"success": True, "data": result}), 200


# ── Documents ─────────────────────────────────────────────
@vendor_bp.route("/upload-documents", methods=["POST"])
@jwt_required()
def upload_docs():
    vendor_id = _get_vendor_id()
    file = request.files.get("file")
    doc_type = request.form.get("doc_type")

    doc, error = upload_document(vendor_id, file, doc_type)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"success": True, "data": doc}), 201


# ── Status ────────────────────────────────────────────────
@vendor_bp.route("/status", methods=["GET"])
@jwt_required()
def status():
    vendor_id = _get_vendor_id()
    result, error = get_vendor_status(vendor_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify({"success": True, "data": result}), 200


# ── Profile ───────────────────────────────────────────────
@vendor_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    vendor_id = _get_vendor_id()
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "data": public_vendor(vendor)}), 200


@vendor_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    vendor_id = _get_vendor_id()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    if "location" in data and data["location"].lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400

    vendor = update_vendor(vendor_id, data)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "data": public_vendor(vendor)}), 200


# ── Public listing (keep existing routes working) ─────────
@vendor_bp.route("/list", methods=["GET"])
def list_vendors():
    location = request.args.get("location")
    all_vendors = get_vendors()
    if location:
        if location.lower() not in VALID_LOCATIONS:
            return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400
        filtered = [v for v in all_vendors if location.lower() in v["locations"]]
        return jsonify({"success": True, "count": len(filtered), "data": filtered}), 200
    return jsonify({"success": True, "count": len(all_vendors), "data": all_vendors}), 200


@vendor_bp.route("/recommend", methods=["GET"])
def recommend():
    location = request.args.get("location")
    capacity_kw = request.args.get("capacity_kw")
    if not location:
        return jsonify({"error": "location is required"}), 400
    if location.lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400
    try:
        capacity_kw = float(capacity_kw) if capacity_kw else None
    except ValueError:
        return jsonify({"error": "capacity_kw must be a number"}), 400
    results = recommend_vendors(location, capacity_kw)
    return jsonify({"success": True, "location": location, "top_vendors": results}), 200
