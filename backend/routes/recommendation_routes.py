"""
AI Recommendation Routes
Provides vendor and scheme recommendations using trained ML models.
"""
from flask import Blueprint, request, jsonify
import joblib
import os
from services.vendor_service import recommend_vendors

recommendation_bp = Blueprint("recommendations", __name__, url_prefix="/recommend")

# Global variables to store loaded models
vendor_model = None
scheme_model = None
location_encoder = None

def load_models():
    """Load ML models on app startup."""
    global vendor_model, scheme_model, location_encoder

    # __file__ is routes/recommendation_routes.py, so go up one level to backend/models/
    model_dir = os.path.join(os.path.dirname(__file__), "..", "models")

    vendor_model_path = os.path.join(model_dir, "vendor_recommendation_model.pkl")
    scheme_model_path = os.path.join(model_dir, "scheme_recommendation_model.pkl")
    encoder_path      = os.path.join(model_dir, "location_encoder.pkl")

    try:
        vendor_model = joblib.load(vendor_model_path)
        print("[OK] Vendor recommendation model loaded")
    except Exception as e:
        print("Model loading error:", str(e))

    try:
        scheme_model = joblib.load(scheme_model_path)
        print("[OK] Scheme recommendation model loaded")
    except Exception as e:
        print("Model loading error:", str(e))

    try:
        location_encoder = joblib.load(encoder_path)
        print("[OK] Location encoder loaded")
    except Exception as e:
        print("Model loading error:", str(e))

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]

@recommendation_bp.route("/vendor", methods=["POST"])
def recommend_vendor():
    """
    Recommend best vendor based on price, rating, warranty.
    """
    try:
        if vendor_model is None:
            return jsonify({"error": "Vendor model not loaded. Please run train_models.py first."}), 503
        
        data = request.get_json()
        
        # Validate input
        if not all(k in data for k in ["price", "rating", "warranty", "location"]):
            return jsonify({"error": "Missing required fields: price, rating, warranty, location"}), 400
        
        price = float(data.get("price"))
        rating = float(data.get("rating"))
        warranty = float(data.get("warranty"))
        location = data.get("location", "central").lower()
        if location not in VALID_LOCATIONS:
            location = "central"
        
        # Validate ranges
        if not (20000 <= price <= 1500000):
            return jsonify({"error": "Price should be between ₹20,000 and ₹1,500,000"}), 400
        if not (1 <= rating <= 5):
            return jsonify({"error": "Rating should be between 1 and 5"}), 400
        if not (0.5 <= warranty <= 15):
            return jsonify({"error": "Warranty should be between 0.5 and 15 years"}), 400
        
        # Find best vendor(s) available in the selected location
        candidates = recommend_vendors(location, top_n=100)
        location_matches = [v for v in candidates if v.get("location_matched")]
        best = location_matches[0] if location_matches else (candidates[0] if candidates else None)

        if best:
            score = float(vendor_model.predict([[best["price_per_kw_inr"], best["rating"], warranty]])[0])
            score = max(0, min(100, score))
            if best.get("location_matched"):
                if score >= 75:
                    recommendation = f"AI recommendation: {best['name']} is an excellent match in {location.title()} with good pricing and strong rating."
                    confidence = "high"
                elif score >= 60:
                    recommendation = f"AI recommendation: {best['name']} is a good local vendor match for your needs."
                    confidence = "medium"
                else:
                    recommendation = f"AI recommendation: {best['name']} is available in your area, but compare other vendors before deciding."
                    confidence = "medium"
            else:
                recommendation = f"AI recommendation: {best['name']} is available in a nearby region and is the best match we could find for {location.title()}."
                confidence = "medium"
            vendor_info = {
                "name": best["name"],
                "price_per_kw": best["price_per_kw_inr"],
                "rating": best["rating"]
            }
        else:
            score = 0.0
            recommendation = "No approved vendor is available for your selected location right now. Please try a nearby region or check back later."
            confidence = "low"
            vendor_info = {
                "name": "No vendor available",
                "price_per_kw": 0,
                "rating": 0
            }

        return jsonify({
            "success": True,
            "vendor_score": round(score, 2),
            "recommendation": recommendation,
            "confidence": confidence,
            "vendor": vendor_info,
            "factors": {
                "price": "Lower is better",
                "rating": f"Strong at {rating}/5",
                "warranty": f"Coverage: {warranty} years"
            }
        }), 200
        
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Recommendation failed: {str(e)}"}), 500

@recommendation_bp.route("/scheme", methods=["POST"])
def recommend_scheme():
    """
    Recommend best government scheme based on location, budget, capacity.
    
    Request body:
    {
        "location": "south",       # north, south, east, west, central
        "budget": 250000,          # Budget in INR
        "capacity": 3.5            # System capacity in kW
    }
    
    Response:
    {
        "success": true,
        "recommended_scheme": "Prime Minister Awas Yojana (PMAY)",
        "eligibility": "high",
        "estimated_subsidy": 75000,
        "details": "You are eligible for this scheme...",
        "alternatives": ["National Solar Mission", "State Subsidy Scheme"]
    }
    """
    try:
        if scheme_model is None or location_encoder is None:
            return jsonify({"error": "Scheme model not loaded. Please run train_models.py first."}), 503
        
        data = request.get_json()
        
        # Validate input
        if not all(k in data for k in ["location", "budget", "capacity"]):
            return jsonify({"error": "Missing required fields: location, budget, capacity"}), 400
        
        location = data.get("location", "central")
        budget = float(data.get("budget"))
        capacity = float(data.get("capacity"))

        # Sanitise location — default to "central" if invalid
        valid_locations = ["north", "south", "east", "west", "central"]
        if location not in valid_locations:
            location = "central"
        
        # Validate ranges
        if not (50000 <= budget <= 1500000):
            return jsonify({"error": "Budget should be between ₹50,000 and ₹1,500,000"}), 400
        if not (0.5 <= capacity <= 20):
            return jsonify({"error": "Capacity should be between 0.5 and 20 kW"}), 400
        
        # Encode location
        location_encoded = location_encoder.transform([location])[0]
        
        # Predict scheme
        scheme_pred = scheme_model.predict([[location_encoded, budget, capacity]])[0]
        
        # Map predictions to actual schemes
        # Model outputs class 4 or 5 only
        schemes = {
            4: {
                "name": "National Solar Mission",
                "subsidy_percent": 35,
                "estimated_subsidy": budget * 0.35
            },
            5: {
                "name": "Prime Minister Awas Yojana (PMAY)",
                "subsidy_percent": 30,
                "estimated_subsidy": budget * 0.30
            },
            0: {
                "name": "State Subsidy Scheme",
                "subsidy_percent": 20,
                "estimated_subsidy": budget * 0.20
            },
            3: {
                "name": "Prime Minister Awas Yojana (PMAY)",
                "subsidy_percent": 30,
                "estimated_subsidy": budget * 0.30
            },
        }

        # Default to National Solar Mission if prediction not in map
        default_scheme = {
            "name": "National Solar Mission",
            "subsidy_percent": 35,
            "estimated_subsidy": budget * 0.35
        }
        scheme_info = schemes.get(int(scheme_pred), default_scheme)
        
        # Determine eligibility
        if budget >= 200000:
            eligibility = "high"
        elif budget >= 100000:
            eligibility = "medium"
        else:
            eligibility = "emerging"
        
        return jsonify({
            "success": True,
            "recommended_scheme": scheme_info["name"],
            "scheme": {
                "name": scheme_info["name"],
                "subsidy": round(scheme_info["estimated_subsidy"], 2),
                "max_amount": round(budget * (scheme_info["subsidy_percent"] / 100) * 1.2, 2)
            },
            "eligibility": eligibility,
            "subsidy_percentage": scheme_info["subsidy_percent"],
            "estimated_subsidy": round(scheme_info["estimated_subsidy"], 2),
            "details": f"Based on your location ({location}), budget (\u20b9{budget:,.0f}), and system capacity ({capacity} kW), you are eligible for {scheme_info['name']} with estimated subsidy of \u20b9{scheme_info['estimated_subsidy']:,.0f}.",
            "alternatives": [
                "Prime Minister Awas Yojana (PMAY)",
                "National Solar Mission",
                "State Subsidy Scheme"
            ],
            "next_steps": [
                "1. Verify eligibility on official website",
                "2. Prepare required documents",
                "3. Submit application to nodal agency",
                "4. Get approval and proceed with installation"
            ]
        }), 200
        
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid input format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Recommendation failed: {str(e)}"}), 500
