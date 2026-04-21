from datetime import datetime

# In-memory stores
_users = []
_calculations = []
_user_id_counter = 1
_calc_id_counter = 1


# ---------- User ----------
def create_user(name, email, password_hash):
    global _user_id_counter
    user = {
        "id": _user_id_counter,
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow().isoformat()
    }
    _users.append(user)
    _user_id_counter += 1
    return user


def find_user_by_email(email):
    return next((u for u in _users if u["email"] == email), None)


def find_user_by_id(user_id):
    return next((u for u in _users if u["id"] == user_id), None)


def public_user(user):
    return {k: v for k, v in user.items() if k != "password_hash"}


# ---------- Calculation ----------
def save_calculation(user_id, inputs, results):
    global _calc_id_counter
    calc = {
        "id": _calc_id_counter,
        "user_id": user_id,
        "inputs": inputs,
        "results": results,
        "saved_at": datetime.utcnow().isoformat()
    }
    _calculations.append(calc)
    _calc_id_counter += 1
    return calc


def get_calculations_by_user(user_id):
    return [c for c in _calculations if c["user_id"] == user_id]
