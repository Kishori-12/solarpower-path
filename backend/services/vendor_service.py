VENDORS = [
    {"id": 1,  "name": "SunPower India",        "rating": 4.8, "experience_years": 10, "price_per_kw_inr": 48000, "locations": ["north", "central"], "contact": "sunpower@example.com"},
    {"id": 2,  "name": "GreenSolar Solutions",  "rating": 4.5, "experience_years": 7,  "price_per_kw_inr": 46000, "locations": ["south", "east"],    "contact": "greensolar@example.com"},
    {"id": 3,  "name": "BrightEnergy Co.",      "rating": 4.6, "experience_years": 8,  "price_per_kw_inr": 52000, "locations": ["west", "central"],  "contact": "brightenergy@example.com"},
    {"id": 4,  "name": "SolarNest",             "rating": 4.2, "experience_years": 5,  "price_per_kw_inr": 43000, "locations": ["south", "west"],    "contact": "solarnest@example.com"},
    {"id": 5,  "name": "EcoWatt Systems",       "rating": 4.7, "experience_years": 9,  "price_per_kw_inr": 50000, "locations": ["north", "east"],    "contact": "ecowatt@example.com"},
    {"id": 6,  "name": "RayTech Solar",         "rating": 4.3, "experience_years": 6,  "price_per_kw_inr": 44500, "locations": ["central", "west"],  "contact": "raytech@example.com"},
    {"id": 7,  "name": "SunGrid Energy",        "rating": 4.9, "experience_years": 12, "price_per_kw_inr": 55000, "locations": ["south", "central"], "contact": "sungrid@example.com"},
    {"id": 8,  "name": "Photon Power",          "rating": 4.1, "experience_years": 4,  "price_per_kw_inr": 41000, "locations": ["east", "north"],    "contact": "photon@example.com"},
    {"id": 9,  "name": "CleanRay Solutions",    "rating": 4.4, "experience_years": 6,  "price_per_kw_inr": 47000, "locations": ["west", "south"],    "contact": "cleanray@example.com"},
    {"id": 10, "name": "Surya Tech",            "rating": 4.6, "experience_years": 8,  "price_per_kw_inr": 49000, "locations": ["north", "central"], "contact": "suryatech@example.com"},
]

# Scoring weights (must sum to 1.0)
WEIGHT_LOCATION = 0.40
WEIGHT_RATING   = 0.35
WEIGHT_PRICE    = 0.25


def get_vendors():
    return VENDORS


def _normalize(value, min_val, max_val):
    """Normalize a value to 0-1 scale."""
    if max_val == min_val:
        return 1.0
    return (value - min_val) / (max_val - min_val)


def recommend_vendors(location, system_capacity_kw=None, top_n=3):
    vendors = VENDORS
    location = location.lower()

    prices = [v["price_per_kw_inr"] for v in vendors]
    ratings = [v["rating"] for v in vendors]
    min_price, max_price = min(prices), max(prices)
    min_rating, max_rating = min(ratings), max(ratings)

    scored = []
    for v in vendors:
        # Location score: 1.0 if matched, 0.0 if not
        location_score = 1.0 if location in v["locations"] else 0.0

        # Rating score: normalized 0-1 (higher is better)
        rating_score = _normalize(v["rating"], min_rating, max_rating)

        # Price score: normalized 0-1, inverted (lower price = higher score)
        price_score = 1.0 - _normalize(v["price_per_kw_inr"], min_price, max_price)

        # Weighted final score
        final_score = (
            WEIGHT_LOCATION * location_score +
            WEIGHT_RATING   * rating_score +
            WEIGHT_PRICE    * price_score
        )

        entry = {**v, "score": round(final_score, 4), "location_matched": bool(location_score)}

        # Add estimated total cost if capacity provided
        if system_capacity_kw:
            entry["estimated_total_cost_inr"] = round(v["price_per_kw_inr"] * system_capacity_kw)

        scored.append(entry)

    # Sort by score descending, then rating descending as tiebreaker
    scored.sort(key=lambda x: (x["score"], x["rating"]), reverse=True)

    return scored[:top_n]
