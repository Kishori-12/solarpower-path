from flask import Blueprint, jsonify, request
from models.scheme_model import get_all_schemes
from services.scheme_service import recommend_scheme

scheme_bp = Blueprint("scheme", __name__)


@scheme_bp.route("/get-schemes", methods=["GET"])
def schemes():
    try:
        return jsonify({"success": True, "data": get_all_schemes(active_only=True)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── AI-based Recommendation ───────────────────────────────
@scheme_bp.route("/recommend/scheme", methods=["POST"])
def recommend_ai():
    """
    AI-based scheme recommendation using pre-trained ML model.
    
    Expected JSON input:
    {
        "location": "north",
        "budget": 100000,
        "capacity": 5.0
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    # Validate required fields
    location = data.get("location")
    budget = data.get("budget")
    capacity = data.get("capacity")
    
    if location is None or budget is None or capacity is None:
        return jsonify({
            "error": "Missing required fields",
            "required": ["location", "budget", "capacity"]
        }), 400
    
    # Call the AI recommendation function
    result = recommend_scheme(location, budget, capacity)
    
    if result.get("success"):
        return jsonify(result), 200
    else:
        return jsonify(result), 400
