from models.vendor_model import get_all_approved_vendors

# Scoring weights (must sum to 1.0)
WEIGHT_LOCATION = 0.40
WEIGHT_RATING   = 0.35
WEIGHT_PRICE    = 0.25


def _load_vendor_list():
    try:
        vendors = get_all_approved_vendors()
        if vendors:
            return vendors
    except Exception as e:
        print(f"[vendor_service] Failed to load vendors from Firestore: {e}")
    return []


def get_vendors():
    return _load_vendor_list()


def _normalize(value, min_val, max_val):
    """Normalize a value to 0-1 scale."""
    if max_val == min_val:
        return 1.0
    return (value - min_val) / (max_val - min_val)


def recommend_vendors(location, system_capacity_kw=None, top_n=3):
    vendors = _load_vendor_list()
    location = location.lower()

    if not vendors:
        return []

    # Normalize vendor fields for compatibility between Firestore and static demo schemas.
    normalized = []
    for vendor in vendors:
        price = vendor.get("price_per_kw_inr") if vendor.get("price_per_kw_inr") is not None else vendor.get("price_per_kw")
        locations = vendor.get("locations") or ([vendor.get("location")] if vendor.get("location") else [])
        normalized.append({
            **vendor,
            "price_per_kw_inr": price,
            "locations": [loc.lower() for loc in locations if loc],
        })

    prices = [v["price_per_kw_inr"] for v in normalized if isinstance(v["price_per_kw_inr"], (int, float))]
    ratings = [v["rating"] for v in normalized if isinstance(v["rating"], (int, float))]

    if not prices or not ratings:
        return []

    min_price, max_price = min(prices), max(prices)
    min_rating, max_rating = min(ratings), max(ratings)

    scored = []
    for v in normalized:
        price = v["price_per_kw_inr"]
        rating = v["rating"]

        location_score = 1.0 if location in v["locations"] else 0.0
        rating_score = _normalize(rating, min_rating, max_rating)
        price_score = 1.0 - _normalize(price, min_price, max_price)

        final_score = (
            WEIGHT_LOCATION * location_score +
            WEIGHT_RATING   * rating_score +
            WEIGHT_PRICE    * price_score
        )

        entry = {**v, "score": round(final_score, 4), "location_matched": bool(location_score)}
        if system_capacity_kw and isinstance(price, (int, float)):
            entry["estimated_total_cost_inr"] = round(price * system_capacity_kw)

        scored.append(entry)

    scored.sort(key=lambda x: (x["score"], x["rating"]), reverse=True)
    return scored[:top_n]


# ── AI-based Vendor Recommendation (using pre-trained ML model) ────
import joblib
import os

_vendor_model = None

def _load_vendor_model():
    """Load the pre-trained vendor recommendation model."""
    global _vendor_model
    if _vendor_model is None:
        try:
            model_path = os.path.join(os.path.dirname(__file__), "..", "models", "vendor_recommendation_model.pkl")
            _vendor_model = joblib.load(model_path)
        except Exception as e:
            raise Exception(f"Failed to load vendor recommendation model: {str(e)}")
    return _vendor_model

def recommend_vendor(price, rating, warranty, location=None):
    """
    Recommend a vendor using the pre-trained ML model.
    
    Args:
        price (float): Price of the vendor offering (e.g., price_per_kw_inr)
        rating (float): Rating of the vendor (e.g., 4.5)
        warranty (int/float): Warranty period in years
        location (str, optional): Preferred vendor location, e.g. 'central'
    
    Returns:
        dict: Prediction result with vendor recommendation
    """
    try:
        if price is None or rating is None or warranty is None:
            raise ValueError("price, rating, and warranty are required fields")
        
        model = _load_vendor_model()
        
        # Prepare feature array for prediction
        features = [[price, rating, warranty]]
        
        # Make prediction
        prediction = model.predict(features)
        
        return {
            "success": True,
            "vendor": str(prediction[0]),
            "confidence": "high" if hasattr(model, 'predict_proba') else "medium",
            "preferred_location": location.lower() if isinstance(location, str) else None
        }
    except ValueError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Model prediction failed: {str(e)}"}
