from flask import Blueprint, jsonify
from models.scheme_model import get_all_schemes

scheme_bp = Blueprint("scheme", __name__)


@scheme_bp.route("/get-schemes", methods=["GET"])
def schemes():
    try:
        return jsonify({"success": True, "data": get_all_schemes(active_only=True)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
