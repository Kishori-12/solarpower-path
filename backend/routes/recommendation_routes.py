"""
AI Recommendation Routes
Provides dynamic vendor and scheme recommendations using ML models and Firestore data.
"""
from flask import Blueprint, request, jsonify
import joblib
import os
from services.vendor_service import recommend_vendors

recommendation_bp = Blueprint("recommendations", __name__, url_prefix="/recommend")

# Global variables to store loaded models
scheme_model = None
location_encoder = None

def load_models():
    """Load ML models for scheme recommendations."""
    global scheme_model, location_encoder

    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")

    scheme_model_path = os.path.join(model_dir, "scheme_recommendation_model.pkl")
    encoder_path = os.path.join(model_dir, "location_encoder.pkl")

    try:
        scheme_model = joblib.load(scheme_model_path)
        print("[OK] Scheme recommendation model loaded")
    except Exception as e:
        print("Scheme model loading error:", str(e))

    try:
        location_encoder = joblib.load(encoder_path)
        print("[OK] Location encoder loaded")
    except Exception as e:
        print("Location encoder loading error:", str(e))

# Load models on import
load_models()

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]

# Scheme mapping from ML prediction to scheme names
SCHEME_MAPPING = {
    0: {
        "name": "PM Surya Ghar Yojana",
        "subsidy": 40,
        "max_amount": 78000,
        "eligibility": "Residential households"
    },
    1: {
        "name": "Kusum Solar Scheme",
        "subsidy": 30,
        "max_amount": 60000,
        "eligibility": "Farmers and agricultural users"
    },
    2: {
        "name": "National Rooftop Solar Program",
        "subsidy": 20,
        "max_amount": 30000,
        "eligibility": "All categories"
    }
}

@recommendation_bp.route("/vendor", methods=["POST"])
def recommend_vendor():
    try:
        data = request.get_json() or {}
        print("VENDOR INPUT:", data)

        price = data.get("price_per_kw")
        rating = data.get("rating")
        exp = data.get("experience_years")

        if price is None or rating is None or exp is None:
            return jsonify({"error": "Missing vendor inputs"}), 400

        location = str(data.get("location", "central")).lower()
        if location not in VALID_LOCATIONS:
            location = "central"

        vendors = recommend_vendors(location)
        if not vendors:
            return jsonify({
                "success": False,
                "vendor_score": 0,
                "recommendation": "No approved vendor is available for your selected location right now.",
                "confidence": "low",
                "vendor": {"name": "No vendor available", "price_per_kw": 0, "rating": 0},
                "factors": {"price": "N/A", "rating": "N/A", "warranty": "N/A"},
            }), 200

        best_vendor = vendors[0]
        name = best_vendor.get("company_name") or best_vendor.get("name") or "Approved Vendor"
        price_val = best_vendor.get("price_per_kw_inr") if best_vendor.get("price_per_kw_inr") is not None else best_vendor.get("price_per_kw", 0)
        rating_val = float(best_vendor.get("rating") or 0)
        score_pct = round(float(best_vendor.get("score", 0)) * 100, 1)
        confidence = "high" if best_vendor.get("location_matched") else "medium"

        return jsonify({
            "success": True,
            "vendor_score": score_pct,
            "recommendation": f"Recommended approved vendor in {location.title()} based on current pricing and local approval.",
            "confidence": confidence,
            "vendor": {
                "name": name,
                "price_per_kw": price_val,
                "rating": rating_val,
            },
            "factors": {
                "price": f"₹{price_val}/kW",
                "rating": f"{rating_val}/5",
                "warranty": f"{exp} yrs",
            },
        })

    except Exception as e:
        print("🔥 VENDOR ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

@recommendation_bp.route("/scheme", methods=["POST"])
def recommend_scheme():
    try:
        data = request.get_json() or {}
        print("SCHEME INPUT:", data)

        location = data.get("location")
        budget = data.get("budget")
        capacity = data.get("capacity")

        if not location or not budget or not capacity:
            return jsonify({"error": "Missing scheme inputs"}), 400

        location = str(location).lower()
        if location not in VALID_LOCATIONS:
            location = "central"

        if scheme_model is None or location_encoder is None:
            return jsonify({"error": "Scheme model not loaded. Please run train_models.py first."}), 503

        # Encode location
        loc_encoded = location_encoder.transform([location])[0]

        # Create feature array
        features = [[loc_encoded, float(budget), float(capacity)]]
        print("Scheme prediction input:", features)

        # Run ML prediction
        prediction = scheme_model.predict(features)[0]
        print("Predicted scheme index:", prediction)

        # Map prediction to scheme
        scheme_info = SCHEME_MAPPING.get(int(prediction))
        if not scheme_info:
            return jsonify({"error": "Invalid scheme prediction"}), 500

        predicted_scheme_name = scheme_info["name"]
        print("Predicted scheme:", predicted_scheme_name)

        # Calculate estimated subsidy
        subsidy_pct = scheme_info["subsidy"]
        max_amount = scheme_info["max_amount"]
        estimated_subsidy = min(max_amount, int((float(budget) * subsidy_pct) / 100))

        return jsonify({
            "success": True,
            "recommended_scheme": predicted_scheme_name,
            "scheme": {
                "name": predicted_scheme_name,
                "subsidy": subsidy_pct,
                "max_amount": max_amount,
                "eligibility": scheme_info["eligibility"]
            },
            "eligibility": scheme_info["eligibility"],
            "subsidy_percentage": subsidy_pct,
            "estimated_subsidy": estimated_subsidy,
            "details": f"Recommended based on ML prediction for {location} location with budget ₹{budget} and capacity {capacity}kW.",
            "alternatives": [SCHEME_MAPPING[i]["name"] for i in SCHEME_MAPPING if i != int(prediction)],
            "next_steps": [
                "Visit the official scheme website for detailed application process.",
                "Contact your local solar energy department for eligibility verification."
            ],
        })

    except Exception as e:
        print("🔥 SCHEME ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
