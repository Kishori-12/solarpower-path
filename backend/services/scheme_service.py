from models.scheme_model import get_all_schemes

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]


def get_schemes():
    """Return all active schemes from DB."""
    try:
        return get_all_schemes(active_only=True)
    except Exception:
        return []

def recommend_scheme(location, budget, capacity):
    try:
        if location is None or budget is None or capacity is None:
            raise ValueError("location, budget, and capacity are required fields")

        location = str(location).lower().strip()
        budget   = float(budget)
        capacity = float(capacity)

        if location not in VALID_LOCATIONS:
            location = "central"

        # Rule-based scheme selection by capacity + budget
        if capacity <= 3 and budget >= 100000:
            scheme = {"name": "PM Surya Ghar Muft Bijli Yojana",  "subsidy_percent": 40, "subsidy": min(budget * 0.40, 78000)}
        elif capacity <= 10 and budget >= 150000:
            scheme = {"name": "MNRE Rooftop Solar Phase II",       "subsidy_percent": 30, "subsidy": min(budget * 0.30, 60000)}
        elif budget >= 200000:
            scheme = {"name": "National Solar Mission",            "subsidy_percent": 35, "subsidy": budget * 0.35}
        else:
            scheme = {"name": "State Subsidy Scheme",              "subsidy_percent": 20, "subsidy": budget * 0.20}

        if budget >= 200000:
            eligibility = "high"
        elif budget >= 100000:
            eligibility = "medium"
        else:
            eligibility = "emerging"

        estimated_subsidy = round(scheme["subsidy"], 2)

        return {
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
        }
    except ValueError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": f"Scheme recommendation failed: {str(e)}"}
