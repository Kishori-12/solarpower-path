from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.admin_model import find_admin_by_id
from models.vendor_model import update_vendor_status, find_vendor_by_id, public_vendor
from models.scheme_model import (
    get_all_schemes, get_scheme_by_id,
    create_scheme, update_scheme, delete_scheme,
)
from services.admin_service import (
    get_all_users, get_all_vendors_admin,
    get_vendor_with_docs, get_analytics,
)

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

SCHEME_REQUIRED = ["name", "provider", "subsidy_percent", "max_subsidy_inr", "eligibility"]


# ── Role guard ────────────────────────────────────────────
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()          # "admin:1"
        if not identity or not identity.startswith("admin:"):
            return jsonify({"error": "Admin access required"}), 403
        admin_id = int(identity.split(":")[1])
        admin = find_admin_by_id(admin_id)
        if not admin:
            return jsonify({"error": "Admin not found"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ── Analytics ─────────────────────────────────────────────
@admin_bp.route("/analytics", methods=["GET"])
@admin_required
def analytics():
    return jsonify({"success": True, "data": get_analytics()}), 200


# ── Users ─────────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
@admin_required
def users():
    return jsonify({"success": True, "data": get_all_users()}), 200


# ── Vendors ───────────────────────────────────────────────
@admin_bp.route("/vendors", methods=["GET"])
@admin_required
def vendors():
    status_filter = request.args.get("status")
    all_vendors = get_all_vendors_admin()
    if status_filter:
        all_vendors = [v for v in all_vendors if v["status"] == status_filter]
    return jsonify({"success": True, "count": len(all_vendors), "data": all_vendors}), 200


@admin_bp.route("/vendors/<int:vendor_id>", methods=["GET"])
@admin_required
def vendor_detail(vendor_id):
    vendor = get_vendor_with_docs(vendor_id)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "data": vendor}), 200


@admin_bp.route("/vendor/approve/<int:vendor_id>", methods=["PUT"])
@admin_required
def approve_vendor(vendor_id):
    vendor = update_vendor_status(vendor_id, "approved")
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "message": "Vendor approved", "data": public_vendor(vendor)}), 200


@admin_bp.route("/vendor/reject/<int:vendor_id>", methods=["PUT"])
@admin_required
def reject_vendor(vendor_id):
    data = request.get_json() or {}
    reason = data.get("reason", "Does not meet platform requirements")
    vendor = update_vendor_status(vendor_id, "rejected", rejection_reason=reason)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "message": "Vendor rejected", "data": public_vendor(vendor)}), 200


# ── Schemes CRUD ──────────────────────────────────────────
@admin_bp.route("/schemes", methods=["GET"])
@admin_required
def list_schemes():
    return jsonify({"success": True, "data": get_all_schemes()}), 200


@admin_bp.route("/schemes", methods=["POST"])
@admin_required
def add_scheme():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    missing = [f for f in SCHEME_REQUIRED if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    scheme = create_scheme(data)
    return jsonify({"success": True, "data": scheme}), 201


@admin_bp.route("/schemes/<int:scheme_id>", methods=["PUT"])
@admin_required
def edit_scheme(scheme_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    scheme = update_scheme(scheme_id, data)
    if not scheme:
        return jsonify({"error": "Scheme not found"}), 404
    return jsonify({"success": True, "data": scheme}), 200


@admin_bp.route("/schemes/<int:scheme_id>", methods=["DELETE"])
@admin_required
def remove_scheme(scheme_id):
    if not delete_scheme(scheme_id):
        return jsonify({"error": "Scheme not found"}), 404
    return jsonify({"success": True, "message": "Scheme deleted"}), 200
