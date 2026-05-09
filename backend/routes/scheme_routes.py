from flask import Blueprint, jsonify, request
import joblib
import os
from models.scheme_model import get_all_schemes

scheme_bp = Blueprint("scheme", __name__)

scheme_model = None
location_encoder = None

def load_scheme_models():
    global scheme_model, location_encoder
    if scheme_model is None:
        scheme_model = joblib.load(os.path.join(os.path.dirname(__file__), "..", "models", "scheme_recommendation_model.pkl"))
    if location_encoder is None:
        location_encoder = joblib.load(os.path.join(os.path.dirname(__file__), "..", "models", "location_encoder.pkl"))


@scheme_bp.route("/get-schemes", methods=["GET"])
def schemes():
    try:
        return jsonify({"success": True, "data": get_all_schemes(active_only=True)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── AI-based Recommendation ───────────────────────────────
@scheme_bp.route("/recommend/scheme", methods=["POST"])
def recommend_ai():
    try:
        data = request.get_json() or {}
        print("SCHEME INPUT:", data)

        location = data.get("location")
        budget = data.get("budget")
        capacity = data.get("capacity")

        if not location or budget is None or capacity is None:
            return jsonify({"error": "Missing scheme inputs"}), 400

        if location not in ["north", "south", "central"]:
            print("INVALID LOCATION:", location)
            location = "central"

        load_scheme_models()

        loc_encoded = location_encoder.transform([location])[0]

        X = [[loc_encoded, float(budget), float(capacity)]]
        print("SCHEME FEATURES:", X)

        pred = scheme_model.predict(X)[0]

        return jsonify({
            "scheme": {
                "name": "PM Surya Ghar Yojana",
                "subsidy": "40%"
            }
        })
    except Exception as e:
        print("🔥 SCHEME ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
