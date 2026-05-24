"""
Seed Firestore with vendors and schemes using Firebase REST API.
No service account needed - uses web API key.
Run: python seed_firestore.py
"""
import requests
import json

PROJECT_ID = "solarwise-30e48"
API_KEY    = "AIzaSyAwAS3emloLHnqWtVWzDOBSo6dZVXqOFgk"
BASE_URL   = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

VENDORS = [
    {"name": "Navitas Solar",      "price_per_kw_inr": 28000, "rating": 3.6, "warranty_years": 8,  "locations": ["south", "east"],    "status": "approved", "experience_years": 3},
    {"name": "SunEdison India",     "price_per_kw_inr": 30000, "rating": 3.7, "warranty_years": 8,  "locations": ["east", "central"],  "status": "approved", "experience_years": 3},
    {"name": "Saatvik Green",       "price_per_kw_inr": 33000, "rating": 3.9, "warranty_years": 10, "locations": ["north", "east"],    "status": "approved", "experience_years": 5},
    {"name": "Ujaas Energy",        "price_per_kw_inr": 36000, "rating": 3.8, "warranty_years": 10, "locations": ["central", "west"],  "status": "approved", "experience_years": 4},
    {"name": "Goldi Solar",         "price_per_kw_inr": 40000, "rating": 4.0, "warranty_years": 12, "locations": ["west", "central"],  "status": "approved", "experience_years": 6},
    {"name": "Renewsys India",      "price_per_kw_inr": 42000, "rating": 4.2, "warranty_years": 15, "locations": ["south", "east"],    "status": "approved", "experience_years": 7},
    {"name": "Fortum Solar",        "price_per_kw_inr": 44000, "rating": 4.0, "warranty_years": 15, "locations": ["east", "central"],  "status": "approved", "experience_years": 7},
    {"name": "Loom Solar",          "price_per_kw_inr": 45000, "rating": 4.3, "warranty_years": 20, "locations": ["north", "west"],    "status": "approved", "experience_years": 8},
    {"name": "Rays Power Infra",    "price_per_kw_inr": 47000, "rating": 4.2, "warranty_years": 18, "locations": ["central", "west"],  "status": "approved", "experience_years": 9},
    {"name": "Premier Energies",    "price_per_kw_inr": 48000, "rating": 4.1, "warranty_years": 18, "locations": ["south", "central"], "status": "approved", "experience_years": 9},
    {"name": "Jakson Solar",        "price_per_kw_inr": 50000, "rating": 4.3, "warranty_years": 20, "locations": ["north", "central"], "status": "approved", "experience_years": 10},
    {"name": "Vikram Solar",        "price_per_kw_inr": 52000, "rating": 4.5, "warranty_years": 20, "locations": ["east", "north"],    "status": "approved", "experience_years": 10},
    {"name": "Waaree Energies",     "price_per_kw_inr": 53000, "rating": 4.4, "warranty_years": 22, "locations": ["west", "south"],    "status": "approved", "experience_years": 11},
    {"name": "CleanMax Solar",      "price_per_kw_inr": 54000, "rating": 4.4, "warranty_years": 22, "locations": ["south", "west"],    "status": "approved", "experience_years": 11},
    {"name": "Adani Solar",         "price_per_kw_inr": 55000, "rating": 4.6, "warranty_years": 25, "locations": ["west", "central"],  "status": "approved", "experience_years": 12},
    {"name": "Amplus Solar",        "price_per_kw_inr": 56000, "rating": 4.5, "warranty_years": 23, "locations": ["north", "south"],   "status": "approved", "experience_years": 13},
    {"name": "Tata Power Solar",    "price_per_kw_inr": 58000, "rating": 4.8, "warranty_years": 25, "locations": ["north", "central"], "status": "approved", "experience_years": 15},
    {"name": "Azure Power",         "price_per_kw_inr": 61000, "rating": 4.7, "warranty_years": 25, "locations": ["north", "west"],    "status": "approved", "experience_years": 14},
    {"name": "ReNew Power",         "price_per_kw_inr": 64000, "rating": 4.6, "warranty_years": 25, "locations": ["south", "central"], "status": "approved", "experience_years": 13},
    {"name": "Greenko Solar",       "price_per_kw_inr": 68000, "rating": 4.9, "warranty_years": 30, "locations": ["south", "east"],    "status": "approved", "experience_years": 16},
]

SCHEMES = [
    {"name": "PM Surya Ghar Muft Bijli Yojana", "provider": "Government of India",                    "subsidy_percent": 40, "max_subsidy_inr": 78000,  "eligibility": "Residential households",    "link": "https://pmsuryaghar.gov.in",       "active": True},
    {"name": "MNRE Rooftop Solar Phase II",      "provider": "Ministry of New and Renewable Energy",  "subsidy_percent": 30, "max_subsidy_inr": 60000,  "eligibility": "Residential and commercial", "link": "https://mnre.gov.in/solar/rooftop", "active": True},
    {"name": "National Solar Mission",           "provider": "Government of India",                    "subsidy_percent": 35, "max_subsidy_inr": 100000, "eligibility": "All categories",             "link": "https://mnre.gov.in",               "active": True},
    {"name": "State Subsidy Scheme",             "provider": "State Government",                       "subsidy_percent": 20, "max_subsidy_inr": 30000,  "eligibility": "All categories",             "link": "https://mnre.gov.in",               "active": True},
]


def to_firestore(data: dict) -> dict:
    """Convert a Python dict to Firestore REST API fields format."""
    fields = {}
    for k, v in data.items():
        if isinstance(v, bool):
            fields[k] = {"booleanValue": v}
        elif isinstance(v, int):
            fields[k] = {"integerValue": str(v)}
        elif isinstance(v, float):
            fields[k] = {"doubleValue": v}
        elif isinstance(v, list):
            fields[k] = {"arrayValue": {"values": [{"stringValue": i} for i in v]}}
        elif isinstance(v, str):
            fields[k] = {"stringValue": v}
        elif v is None:
            fields[k] = {"nullValue": None}
    return {"fields": fields}


def seed_collection(collection: str, items: list, id_field: str = "name"):
    print(f"\nSeeding '{collection}' collection...")
    for item in items:
        doc_id = item[id_field].replace(" ", "_").lower()
        url = f"{BASE_URL}/{collection}/{doc_id}?key={API_KEY}"
        payload = to_firestore(item)
        res = requests.patch(url, json=payload)
        if res.status_code in (200, 201):
            print(f"  [OK] {item[id_field]}")
        else:
            print(f"  [ERROR] {item[id_field]}: {res.status_code} - {res.text[:200]}")


if __name__ == "__main__":
    print(f"Seeding Firestore project: {PROJECT_ID}")
    seed_collection("vendors", VENDORS)
    seed_collection("schemes", SCHEMES)
    print("\nDone! Check Firebase Console to verify data.")
