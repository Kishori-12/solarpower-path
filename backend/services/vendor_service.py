from models.vendor_model import get_all_approved_vendors

# ── Scoring weights (location is now a hard filter, not a weight) ─
WEIGHT_BUDGET   = 0.50
WEIGHT_RATING   = 0.30
WEIGHT_WARRANTY = 0.20

# Price tiers (total installation cost = price_per_kw * capacity_kw)
TIER_ECONOMY   = (0,       150_000)   # up to ₹1.5L
TIER_MID       = (150_000, 300_000)   # ₹1.5L – ₹3L
TIER_PREMIUM   = (300_000, float("inf"))  # above ₹3L

_FALLBACK_VENDORS = [
    {"name": "Navitas Solar",    "price_per_kw_inr": 28_000, "rating": 3.6, "warranty_years": 8,  "locations": ["south", "east"]},
    {"name": "SunEdison India",  "price_per_kw_inr": 30_000, "rating": 3.7, "warranty_years": 8,  "locations": ["east", "central"]},
    {"name": "Saatvik Green",    "price_per_kw_inr": 33_000, "rating": 3.9, "warranty_years": 10, "locations": ["north", "east"]},
    {"name": "Ujaas Energy",     "price_per_kw_inr": 36_000, "rating": 3.8, "warranty_years": 10, "locations": ["central", "west"]},
    {"name": "Goldi Solar",      "price_per_kw_inr": 40_000, "rating": 4.0, "warranty_years": 12, "locations": ["west", "central"]},
    {"name": "Renewsys India",   "price_per_kw_inr": 42_000, "rating": 4.2, "warranty_years": 15, "locations": ["south", "east"]},
    {"name": "Fortum Solar",     "price_per_kw_inr": 44_000, "rating": 4.0, "warranty_years": 15, "locations": ["east", "central"]},
    {"name": "Loom Solar",       "price_per_kw_inr": 45_000, "rating": 4.3, "warranty_years": 20, "locations": ["north", "west"]},
    {"name": "Rays Power Infra", "price_per_kw_inr": 47_000, "rating": 4.2, "warranty_years": 18, "locations": ["central", "west"]},
    {"name": "Premier Energies", "price_per_kw_inr": 48_000, "rating": 4.1, "warranty_years": 18, "locations": ["south", "central"]},
    {"name": "Jakson Solar",     "price_per_kw_inr": 50_000, "rating": 4.3, "warranty_years": 20, "locations": ["north", "central"]},
    {"name": "Vikram Solar",     "price_per_kw_inr": 52_000, "rating": 4.5, "warranty_years": 20, "locations": ["east", "north"]},
    {"name": "Waaree Energies",  "price_per_kw_inr": 53_000, "rating": 4.4, "warranty_years": 22, "locations": ["west", "south"]},
    {"name": "CleanMax Solar",   "price_per_kw_inr": 54_000, "rating": 4.4, "warranty_years": 22, "locations": ["south", "west"]},
    {"name": "Adani Solar",      "price_per_kw_inr": 55_000, "rating": 4.6, "warranty_years": 25, "locations": ["west", "central"]},
    {"name": "Amplus Solar",     "price_per_kw_inr": 56_000, "rating": 4.5, "warranty_years": 23, "locations": ["north", "south"]},
    {"name": "Tata Power Solar", "price_per_kw_inr": 58_000, "rating": 4.8, "warranty_years": 25, "locations": ["north", "central"]},
    {"name": "Azure Power",      "price_per_kw_inr": 61_000, "rating": 4.7, "warranty_years": 25, "locations": ["north", "west"]},
    {"name": "ReNew Power",      "price_per_kw_inr": 64_000, "rating": 4.6, "warranty_years": 25, "locations": ["south", "central"]},
    {"name": "Greenko Solar",    "price_per_kw_inr": 68_000, "rating": 4.9, "warranty_years": 30, "locations": ["south", "east"]},
]


def _load_vendors():
    try:
        vendors = get_all_approved_vendors()
        # Filter out incomplete records (no name or zero rating)
        valid = [v for v in vendors if v.get("name") and v.get("rating") and float(v.get("rating", 0)) > 0]
        if valid:
            return valid
    except Exception as e:
        print(f"[vendor_service] Firestore error: {e}")
    return _FALLBACK_VENDORS


def get_vendors():
    return _load_vendors()


def _normalize(value, min_val, max_val):
    if max_val == min_val:
        return 1.0
    return (value - min_val) / (max_val - min_val)


def _normalize_vendors(vendors):
    """Unify schema between Firestore vendors and static fallback."""
    result = []
    for v in vendors:
        price = v.get("price_per_kw_inr") or v.get("price_per_kw") or 0
        locs  = v.get("locations") or ([v["location"]] if v.get("location") else [])
        result.append({
            **v,
            "price_per_kw_inr": float(price),
            "locations": [l.lower() for l in locs if l],
            "warranty_years": v.get("warranty_years") or v.get("warranty") or 0,
        })
    return result


def _budget_score(price_per_kw, capacity_kw, budget):
    """
    Score how well a vendor fits the user's budget.

    - Total cost within budget           → 1.0  (perfect fit)
    - Total cost slightly over (≤10%)    → 0.7  (still viable)
    - Total cost moderately over (≤30%)  → 0.3  (stretch)
    - Total cost way over (>30%)         → 0.0  (out of range)

    When no budget is given we invert the price (cheaper = better).
    """
    if not budget or budget <= 0:
        return None   # caller will use price inversion instead

    total = price_per_kw * capacity_kw
    if total <= budget:
        # Reward vendors that use the budget efficiently (not too cheap either)
        utilisation = total / budget          # 0 → 1
        # Sweet spot: 70-100% of budget → score 1.0; below 50% → 0.6
        if utilisation >= 0.70:
            return 1.0
        elif utilisation >= 0.50:
            return 0.8
        else:
            return 0.6
    else:
        over_ratio = (total - budget) / budget
        if over_ratio <= 0.10:
            return 0.7
        elif over_ratio <= 0.30:
            return 0.3
        else:
            return 0.0


def recommend_vendors(location, budget=None, system_capacity_kw=None, top_n=5):
    vendors = _normalize_vendors(_load_vendors())
    if not vendors:
        return []

    location    = location.lower()
    capacity_kw = system_capacity_kw or 3.0

    # Strictly filter to only vendors that serve this location
    local_vendors = [v for v in vendors if location in v["locations"]]

    # If no vendors in this location, return empty
    if not local_vendors:
        return []

    prices    = [v["price_per_kw_inr"] for v in local_vendors]
    ratings   = [v["rating"]           for v in local_vendors]
    warranties= [v["warranty_years"]   for v in local_vendors]

    min_p, max_p = min(prices),     max(prices)
    min_r, max_r = min(ratings),    max(ratings)
    min_w, max_w = min(warranties), max(warranties)

    scored = []
    for v in local_vendors:
        price    = v["price_per_kw_inr"]
        rating   = v["rating"]
        warranty = v["warranty_years"]

        rating_score   = _normalize(rating,   min_r, max_r)
        warranty_score = _normalize(warranty, min_w, max_w)

        b_score = _budget_score(price, capacity_kw, budget)
        if b_score is None:
            b_score = 1.0 - _normalize(price, min_p, max_p)

        final = (
            WEIGHT_BUDGET   * b_score       +
            WEIGHT_RATING   * rating_score  +
            WEIGHT_WARRANTY * warranty_score
        )

        total_cost    = round(price * capacity_kw)
        within_budget = (budget is None) or (total_cost <= budget)

        scored.append({
            **v,
            "score":                    round(final, 4),
            "location_matched":         True,
            "within_budget":            within_budget,
            "estimated_total_cost_inr": total_cost,
            "budget_score":             round(b_score, 4),
            "rating_score":             round(rating_score, 4),
        })

    scored.sort(key=lambda x: (x["score"], x["rating"]), reverse=True)
    return scored[:top_n]


def recommend_by_budget(location, budget, system_capacity_kw=None):
    """
    Return vendors grouped into three budget tiers so the frontend
    can show 'Best for your budget', 'Mid-range', 'Premium' sections.

    Args:
        location           (str)  : User's region
        budget             (float): User's total budget in INR
        system_capacity_kw (float): System size in kW

    Returns:
        dict with keys: best_match, economy, mid_range, premium, summary
    """
    vendors    = _normalize_vendors(_load_vendors())
    capacity   = system_capacity_kw or 3.0
    location   = location.lower()

    economy, mid_range, premium = [], [], []

    for v in vendors:
        total = v["price_per_kw_inr"] * capacity
        entry = {
            **v,
            "estimated_total_cost_inr": round(total),
            "location_matched": location in v["locations"],
            "within_budget": total <= budget,
        }
        if total <= TIER_ECONOMY[1]:
            economy.append(entry)
        elif total <= TIER_MID[1]:
            mid_range.append(entry)
        else:
            premium.append(entry)

    def _sort(lst):
        # Within each tier: location match first, then rating
        return sorted(lst, key=lambda x: (x["location_matched"], x["rating"]), reverse=True)

    economy   = _sort(economy)
    mid_range = _sort(mid_range)
    premium   = _sort(premium)

    # Best match = top result from recommend_vendors with budget
    best = recommend_vendors(location, budget, capacity, top_n=3)

    # Determine which tier the user's budget falls into
    if budget <= TIER_ECONOMY[1]:
        budget_tier = "economy"
    elif budget <= TIER_MID[1]:
        budget_tier = "mid_range"
    else:
        budget_tier = "premium"

    affordable = [v for v in vendors if v["price_per_kw_inr"] * capacity <= budget]

    return {
        "best_match":   best,
        "economy":      economy[:3],
        "mid_range":    mid_range[:3],
        "premium":      premium[:3],
        "summary": {
            "budget_inr":          budget,
            "capacity_kw":         capacity,
            "budget_tier":         budget_tier,
            "affordable_count":    len(affordable),
            "total_vendors":       len(vendors),
            "cheapest_total_inr":  round(min(v["price_per_kw_inr"] for v in vendors) * capacity),
            "costliest_total_inr": round(max(v["price_per_kw_inr"] for v in vendors) * capacity),
        },
    }
