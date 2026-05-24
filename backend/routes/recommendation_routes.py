"""
AI Recommendation Routes
Provides vendor and scheme recommendations.
"""
from flask import Blueprint, request, jsonify
import joblib
import os
from services.vendor_service import recommend_vendors

recommendation_bp = Blueprint("recommendations", __name__, url_prefix="/recommend")

vendor_model = None
scheme_model = None
location_encoder = None

def load_models():
    global vendor_model, scheme_model, location_encoder
    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    try:
        vendor_model = joblib.load(os.path.join(model_dir, "vendor_recommendation_model.pkl"))
        print("[OK] Vendor recommendation model loaded")
    except Exception as e:
        print("Model loading error:", str(e))
    try:
        scheme_model = joblib.load(os.path.join(model_dir, "scheme_recommendation_model.pkl"))
        print("[OK] Scheme recommendation model loaded")
    except Exception as e:
        print("Model loading error:", str(e))
    try:
        location_encoder = joblib.load(os.path.join(model_dir, "location_encoder.pkl"))
        print("[OK] Location encoder loaded")
    except Exception as e:
        print("Location encoder loading error:", str(e))

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]


@recommendation_bp.route("/vendor", methods=["POST"])
def recommend_vendor():
    try:
        data = request.get_json() or {}

        if not all(k in data for k in ["budget", "location", "warranty"]):
            return jsonify({"error": "Missing required fields: budget, location, warranty"}), 400

        budget   = float(data.get("budget"))
        warranty = float(data.get("warranty"))
        location = data.get("location", "central").lower()

        if location not in VALID_LOCATIONS:
            location = "central"

        if not (20000 <= budget <= 1500000):
            return jsonify({"error": "Budget should be between Rs.20,000 and Rs.1,500,000"}), 400
        if not (0.5 <= warranty <= 25):
            return jsonify({"error": "Warranty should be between 0.5 and 25 years"}), 400

        all_vendors = recommend_vendors(location, budget=budget, top_n=5)

        if not all_vendors:
            return jsonify({
                "success": True,
                "best_vendor": None,
                "recommendation": f"No vendors found for {location.title()}. Try a different location.",
                "confidence": "low",
                "all_vendors": [],
            }), 200

        results = []
        for v in all_vendors:
            price      = v.get("price_per_kw_inr", 0) or 0
            rating     = v.get("rating", 3.0) or 3.0
            v_warranty = v.get("warranty_years", v.get("warranty", warranty))
            within_budget = (price * 3) <= budget

            results.append({
                "name":             v.get("name", "Unknown"),
                "price_per_kw":     price,
                "rating":           rating,
                "warranty":         v_warranty,
                "location_matched": v.get("location_matched", True),
                "within_budget":    within_budget,
                "score":            round(v["score"] * 100, 2),
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        best = results[0]

        if best["within_budget"]:
            recommendation = f"AI recommendation: {best['name']} is the best match in {location.title()} within your budget with strong rating and warranty."
            confidence = "high"
        else:
            recommendation = f"AI recommendation: {best['name']} is the top vendor in {location.title()}, but may exceed your budget. Consider adjusting."
            confidence = "medium"

        return jsonify({
            "success":        True,
            "best_vendor":    best,
            "recommendation": recommendation,
            "confidence":     confidence,
            "all_vendors":    results,
        }), 200

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@recommendation_bp.route("/scheme", methods=["POST"])
def recommend_scheme():
    try:
        data = request.get_json() or {}

        if not all(k in data for k in ["location", "budget", "capacity"]):
            return jsonify({"error": "Missing required fields: location, budget, capacity"}), 400

        location = data.get("location", "central").lower()
        budget   = float(data.get("budget"))
        capacity = float(data.get("capacity"))

        if location not in VALID_LOCATIONS:
            location = "central"

        if not (50000 <= budget <= 1500000):
            return jsonify({"error": "Budget should be between Rs.50,000 and Rs.1,500,000"}), 400
        if not (0.5 <= capacity <= 20):
            return jsonify({"error": "Capacity should be between 0.5 and 20 kW"}), 400

        # Rule-based scheme selection by capacity + budget
        if capacity <= 3 and budget >= 100000:
            scheme = {"name": "PM Surya Ghar Muft Bijli Yojana", "subsidy_percent": 40, "subsidy": min(budget * 0.40, 78000)}
        elif capacity <= 10 and budget >= 150000:
            scheme = {"name": "MNRE Rooftop Solar Phase II",      "subsidy_percent": 30, "subsidy": min(budget * 0.30, 60000)}
        elif budget >= 200000:
            scheme = {"name": "National Solar Mission",           "subsidy_percent": 35, "subsidy": budget * 0.35}
        else:
            scheme = {"name": "State Subsidy Scheme",             "subsidy_percent": 20, "subsidy": budget * 0.20}

        if budget >= 200000:
            eligibility = "high"
        elif budget >= 100000:
            eligibility = "medium"
        else:
            eligibility = "emerging"

        estimated_subsidy = round(scheme["subsidy"], 2)

        return jsonify({
            "success": True,
            "recommended_scheme": scheme["name"],
            "scheme": {
                "name":       scheme["name"],
                "subsidy":    estimated_subsidy,
                "max_amount": round(estimated_subsidy * 1.2, 2),
            },
            "eligibility":        eligibility,
            "subsidy_percentage": scheme["subsidy_percent"],
            "estimated_subsidy":  estimated_subsidy,
            "details": f"Based on your location ({location.title()}), budget (Rs.{budget:,.0f}), and {capacity} kW system, you qualify for {scheme['name']} with an estimated subsidy of Rs.{estimated_subsidy:,.0f}.",
            "alternatives": ["PM Surya Ghar Muft Bijli Yojana", "MNRE Rooftop Solar Phase II", "State Subsidy Scheme"],
            "next_steps": [
                "1. Verify eligibility on official website",
                "2. Prepare required documents",
                "3. Submit application to nodal agency",
                "4. Get approval and proceed with installation",
            ],
        }), 200

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
