from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.solar_service import calculate_solar, SUNLIGHT_HOURS
from services.scheme_service import get_schemes
from services.vendor_service import recommend_vendors
from models.user_model import save_calculation, get_calculations_by_user

solar_bp = Blueprint("solar", __name__)

VALID_LOCATIONS = list(SUNLIGHT_HOURS.keys())


@solar_bp.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    monthly_bill = data.get("monthly_bill")
    location = data.get("location")
    roof_area = data.get("roof_area")

    if not all([monthly_bill, location, roof_area]):
        return jsonify({"error": "monthly_bill, location, and roof_area are required"}), 400

    try:
        monthly_bill = float(monthly_bill)
        roof_area = float(roof_area)
    except (ValueError, TypeError):
        return jsonify({"error": "monthly_bill and roof_area must be numbers"}), 400

    if monthly_bill <= 0 or roof_area <= 0:
        return jsonify({"error": "monthly_bill and roof_area must be greater than 0"}), 400

    if location.lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400

    try:
        result = calculate_solar(roof_area, location, monthly_bill)
        capacity_kw = result["system"]["recommended_capacity_kw"]

        # Attach top vendors and schemes to the response
        result["recommended_vendors"] = recommend_vendors(location, capacity_kw)
        result["applicable_schemes"] = get_schemes()

        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Keep old endpoint working too
@solar_bp.route("/calculate-solar", methods=["POST"])
def calculate_solar_legacy():
    return calculate()


@solar_bp.route("/save-calculation", methods=["POST"])
@jwt_required()
def save_calc():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    inputs = data.get("inputs")
    results = data.get("results")

    if not inputs or not results:
        return jsonify({"error": "inputs and results are required"}), 400

    try:
        calc = save_calculation(user_id, inputs, results)
        return jsonify({"success": True, "data": calc}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@solar_bp.route("/my-calculations", methods=["GET"])
@jwt_required()
def my_calculations():
    user_id = get_jwt_identity()
    calcs = get_calculations_by_user(user_id)
    return jsonify({"success": True, "count": len(calcs), "data": calcs}), 200
