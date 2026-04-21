from datetime import datetime

_scheme_id_counter = 4
_schemes = [
    {
        "id": 1,
        "name": "PM Surya Ghar Muft Bijli Yojana",
        "provider": "Government of India",
        "subsidy_percent": 40,
        "max_subsidy_inr": 78000,
        "eligibility": "Residential households",
        "link": "https://pmsuryaghar.gov.in",
        "active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 2,
        "name": "MNRE Rooftop Solar Scheme",
        "provider": "Ministry of New and Renewable Energy",
        "subsidy_percent": 30,
        "max_subsidy_inr": 60000,
        "eligibility": "Residential and commercial",
        "link": "https://mnre.gov.in",
        "active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    },
    {
        "id": 3,
        "name": "State Solar Subsidy",
        "provider": "State Government",
        "subsidy_percent": 20,
        "max_subsidy_inr": 30000,
        "eligibility": "All categories",
        "link": "https://example-state-solar.gov.in",
        "active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    },
]


def get_all_schemes(active_only=False):
    if active_only:
        return [s for s in _schemes if s.get("active", True)]
    return list(_schemes)


def get_scheme_by_id(scheme_id: int):
    return next((s for s in _schemes if s["id"] == scheme_id), None)


def create_scheme(data: dict):
    global _scheme_id_counter
    scheme = {
        "id": _scheme_id_counter,
        "name": data["name"],
        "provider": data["provider"],
        "subsidy_percent": int(data["subsidy_percent"]),
        "max_subsidy_inr": int(data["max_subsidy_inr"]),
        "eligibility": data["eligibility"],
        "link": data.get("link", ""),
        "active": data.get("active", True),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    _schemes.append(scheme)
    _scheme_id_counter += 1
    return scheme


def update_scheme(scheme_id: int, data: dict):
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        return None
    allowed = {"name", "provider", "subsidy_percent", "max_subsidy_inr", "eligibility", "link", "active"}
    for k, v in data.items():
        if k in allowed:
            scheme[k] = v
    scheme["updated_at"] = datetime.utcnow().isoformat()
    return scheme


def delete_scheme(scheme_id: int):
    global _schemes
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        return False
    _schemes = [s for s in _schemes if s["id"] != scheme_id]
    return True
