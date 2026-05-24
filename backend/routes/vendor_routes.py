from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.vendor_auth_service import register_vendor, login_vendor
from services.vendor_upload_service import upload_document, get_vendor_status
from services.vendor_service import get_vendors, recommend_vendors, recommend_by_budget
from models.vendor_model import find_vendor_by_id, update_vendor, public_vendor

vendor_bp = Blueprint("vendor", __name__, url_prefix="/vendor")

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]


def _get_vendor_id():
    identity = get_jwt_identity()
    return identity.split(":", 1)[1]


def _parse_float(val, name):
    """Return (float, error_string). error_string is None on success."""
    if val is None:
        return None, None
    try:
        f = float(val)
        if f <= 0:
            return None, f"{name} must be greater than 0"
        return f, None
    except (ValueError, TypeError):
        return None, f"{name} must be a number"


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
    try:
        vendor_id = _get_vendor_id()
        file      = request.files.get("file")
        doc_type  = request.form.get("doc_type")
        if not file:
            return jsonify({"error": "No file provided"}), 400
        if not doc_type:
            return jsonify({"error": "doc_type is required"}), 400
        doc, error = upload_document(vendor_id, file, doc_type)
        if error:
            return jsonify({"error": error}), 400
        return jsonify({"success": True, "data": doc}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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


# ── Public listing ────────────────────────────────────────
@vendor_bp.route("/list", methods=["GET"])
def list_vendors():
    location = request.args.get("location")
    all_vendors = get_vendors()
    if location:
        if location.lower() not in VALID_LOCATIONS:
            return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400
        filtered = [v for v in all_vendors if location.lower() in v.get("locations", [])]
        return jsonify({"success": True, "count": len(filtered), "data": filtered}), 200
    return jsonify({"success": True, "count": len(all_vendors), "data": all_vendors}), 200


# ── Smart recommendation (budget + location + rating + warranty) ──
@vendor_bp.route("/recommend", methods=["GET"])
def recommend():
    """
    Query params:
      location     (required) : north | south | east | west | central
      budget       (optional) : total budget in INR  e.g. 200000
      capacity_kw  (optional) : system size in kW    e.g. 3.5
      top_n        (optional) : number of results    default 3
    """
    location = request.args.get("location")
    if not location:
        return jsonify({"error": "location is required"}), 400
    if location.lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400

    budget, err = _parse_float(request.args.get("budget"), "budget")
    if err:
        return jsonify({"error": err}), 400

    capacity_kw, err = _parse_float(request.args.get("capacity_kw"), "capacity_kw")
    if err:
        return jsonify({"error": err}), 400

    top_n = int(request.args.get("top_n", 3))

    results = recommend_vendors(
        location=location,
        budget=budget,
        system_capacity_kw=capacity_kw,
        top_n=top_n,
    )

    return jsonify({
        "success": True,
        "location": location,
        "budget_inr": budget,
        "capacity_kw": capacity_kw,
        "scoring_weights": {
            "budget_fit": "40%",
            "rating":     "30%",
            "location":   "20%",
            "warranty":   "10%",
        },
        "top_vendors": results,
    }), 200


# ── Budget-tiered recommendation ─────────────────────────
@vendor_bp.route("/recommend/budget", methods=["GET"])
def recommend_budget_tiers():
    """
    Returns vendors grouped into economy / mid-range / premium tiers
    plus the best overall matches for the given budget.

    Query params:
      location    (required)
      budget      (required) : total budget in INR
      capacity_kw (optional) : system size in kW
    """
    location = request.args.get("location")
    if not location:
        return jsonify({"error": "location is required"}), 400
    if location.lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400

    budget, err = _parse_float(request.args.get("budget"), "budget")
    if err:
        return jsonify({"error": err}), 400
    if not budget:
        return jsonify({"error": "budget is required for tiered recommendations"}), 400

    capacity_kw, err = _parse_float(request.args.get("capacity_kw"), "capacity_kw")
    if err:
        return jsonify({"error": err}), 400

    result = recommend_by_budget(
        location=location,
        budget=budget,
        system_capacity_kw=capacity_kw,
    )

    return jsonify({"success": True, "data": result}), 200
