from datetime import datetime
import pytz
from firebase_config import get_db

IST = pytz.timezone('Asia/Kolkata')

def get_ist_datetime():
    try:
        return datetime.now(IST)
    except Exception:
        return datetime.utcnow()


# ---------- User ----------
def create_user(name, email, password_hash):
    try:
        db = get_db()
        user = {
            "name": name,
            "email": email.lower(),
            "password_hash": password_hash,
            "created_at": get_ist_datetime().isoformat(),
        }
        doc_ref = db.collection("users").document()
        doc_ref.set(user)
        user["id"] = doc_ref.id
        return user
    except Exception as e:
        print(f"Error creating user: {e}")
        raise


def find_user_by_email(email):
    try:
        db = get_db()
        docs = db.collection("users").where("email", "==", email.lower()).limit(1).stream()
        for doc in docs:
            u = doc.to_dict()
            u["id"] = doc.id
            return u
        return None
    except Exception as e:
        print(f"Error finding user by email: {e}")
        return None


def find_user_by_id(user_id):
    try:
        db = get_db()
        doc = db.collection("users").document(str(user_id)).get()
        if doc.exists:
            u = doc.to_dict()
            u["id"] = doc.id
            return u
        return None
    except Exception as e:
        print(f"Error finding user by id: {e}")
        return None


def public_user(user):
    return {k: v for k, v in user.items() if k != "password_hash"}


# ---------- Calculation ----------
def save_calculation(user_id, inputs, results):
    try:
        db = get_db()
        calc = {
            "user_id": str(user_id),
            "inputs": inputs,
            "results": results,
            "saved_at": get_ist_datetime().isoformat(),
        }
        doc_ref = db.collection("calculations").document()
        doc_ref.set(calc)
        calc["id"] = doc_ref.id
        return calc
    except Exception as e:
        print(f"Error saving calculation: {e}")
        raise


def get_calculations_by_user(user_id):
    try:
        db = get_db()
        docs = db.collection("calculations").where("user_id", "==", str(user_id)).stream()
        calcs = []
        for doc in docs:
            c = doc.to_dict()
            c["id"] = doc.id
            calcs.append(c)
        return calcs
    except Exception as e:
        print(f"Error getting calculations: {e}")
        return []
