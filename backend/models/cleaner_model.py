import uuid
from firebase_config import get_db

COLLECTION = "cleaners"

def create_cleaner(data):
    db = get_db()
    c_id = str(uuid.uuid4())
    doc_ref = db.collection(COLLECTION).document(c_id)
    new_cleaner = {
        "id": c_id,
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "password_hash": data.get("password_hash", ""),
        "mobile": data.get("mobile", ""),
        "address": data.get("address", ""),
        "experience": data.get("experience", "1 yr"),
        "pricePerVisit": data.get("pricePerVisit", 300),
        "rating": data.get("rating", 4.0),
        "score": data.get("score", 80),
        "status": data.get("status", "pending"),
        "verified": data.get("verified", False),
        "best": data.get("best", False)
    }
    doc_ref.set(new_cleaner)
    return new_cleaner

def find_cleaner_by_email(email):
    db = get_db()
    docs = db.collection(COLLECTION).where("email", "==", email).limit(1).stream()
    for d in docs:
        c = d.to_dict()
        c["id"] = d.id
        return c
    return None

def find_cleaner_by_id(c_id):
    db = get_db()
    doc = db.collection(COLLECTION).document(c_id).get()
    if doc.exists:
        c = doc.to_dict()
        c["id"] = doc.id
        return c
    return None

def get_all_cleaners():
    db = get_db()
    docs = db.collection(COLLECTION).stream()
    cleaners = []
    for d in docs:
        c = d.to_dict()
        c["id"] = d.id
        cleaners.append(c)
    return cleaners

def update_cleaner_status(c_id, verified: bool, status: str = "verified"):
    db = get_db()
    doc_ref = db.collection(COLLECTION).document(c_id)
    doc_ref.update({"verified": verified, "status": status})

def public_cleaner(cleaner):
    if not cleaner: return None
    c = cleaner.copy()
    c.pop("password_hash", None)
    return c
