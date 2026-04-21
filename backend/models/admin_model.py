from datetime import datetime
from werkzeug.security import generate_password_hash

_admins = []
_admin_id_counter = 1


def _seed():
    """Seed a default admin on startup."""
    global _admin_id_counter
    _admins.append({
        "id": _admin_id_counter,
        "name": "Super Admin",
        "email": "admin@solarwise.in",
        "password_hash": generate_password_hash("admin123"),
        "role": "superadmin",
        "created_at": datetime.utcnow().isoformat(),
    })
    _admin_id_counter += 1


_seed()


def find_admin_by_email(email: str):
    return next((a for a in _admins if a["email"] == email.lower()), None)


def find_admin_by_id(admin_id: int):
    return next((a for a in _admins if a["id"] == admin_id), None)


def public_admin(admin: dict):
    return {k: v for k, v in admin.items() if k != "password_hash"}
