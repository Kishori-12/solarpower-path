def get_schemes():
    return [
        {
            "id": 1,
            "name": "PM Surya Ghar Muft Bijli Yojana",
            "provider": "Government of India",
            "subsidy_percent": 40,
            "max_subsidy_inr": 78000,
            "eligibility": "Residential households",
            "link": "https://pmsuryaghar.gov.in"
        },
        {
            "id": 2,
            "name": "MNRE Rooftop Solar Scheme",
            "provider": "Ministry of New and Renewable Energy",
            "subsidy_percent": 30,
            "max_subsidy_inr": 60000,
            "eligibility": "Residential and commercial",
            "link": "https://mnre.gov.in"
        },
        {
            "id": 3,
            "name": "State Solar Subsidy",
            "provider": "State Government",
            "subsidy_percent": 20,
            "max_subsidy_inr": 30000,
            "eligibility": "All categories",
            "link": "https://example-state-solar.gov.in"
        }
    ]


# ── AI-based Scheme Recommendation (using pre-trained ML model) ────
import joblib
import os

_scheme_model = None
_location_encoder = None

def _load_scheme_model():
    """Load the pre-trained scheme recommendation model."""
    global _scheme_model
    if _scheme_model is None:
        try:
            model_path = os.path.join(os.path.dirname(__file__), "..", "models", "scheme_recommendation_model.pkl")
            _scheme_model = joblib.load(model_path)
        except Exception as e:
            raise Exception(f"Failed to load scheme recommendation model: {str(e)}")
    return _scheme_model

def _load_location_encoder():
    """Load the location encoder for encoding location strings."""
    global _location_encoder
    if _location_encoder is None:
        try:
            encoder_path = os.path.join(os.path.dirname(__file__), "..", "models", "location_encoder.pkl")
            _location_encoder = joblib.load(encoder_path)
        except Exception as e:
            raise Exception(f"Failed to load location encoder: {str(e)}")
    return _location_encoder

def recommend_scheme(location, budget, capacity):
    """
    Recommend a scheme using the pre-trained ML model.
    
    Args:
        location (str): Location of the property (e.g., 'north', 'south', 'east', 'west', 'central')
        budget (float): Budget available for installation in INR
        capacity (float): Required solar system capacity in kW
    
    Returns:
        dict: Prediction result with scheme recommendation
    """
    try:
        if location is None or budget is None or capacity is None:
            raise ValueError("location, budget, and capacity are required fields")
        
        model = _load_scheme_model()
        
        # Normalize/encode location if needed
        location_lower = str(location).lower().strip()
        
        # Prepare feature array for prediction
        # Adjust feature order based on your model's training features
        features = [[budget, capacity]]
        
        # Make prediction
        prediction = model.predict(features)
        
        return {
            "success": True,
            "scheme": str(prediction[0]),
            "location": location_lower,
            "budget": budget,
            "capacity": capacity,
            "confidence": "high" if hasattr(model, 'predict_proba') else "medium"
        }
    except ValueError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Model prediction failed: {str(e)}"}
