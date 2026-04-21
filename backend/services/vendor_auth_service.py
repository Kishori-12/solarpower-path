import re
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.vendor_model import create_vendor, find_vendor_by_email, public_vendor

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
VALID_LOCATIONS = {"north", "south", "east", "west", "central"}


def register_vendor(data: dict):
    required = ["company_name", "email", "password", "phone", "location", "price_per_kw", "experience_years"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return None, f"Missing fields: {', '.join(missing)}"

    if not EMAIL_RE.match(data["email"]):
        return None, "Invalid email format"

    if len(data["password"]) < 6:
        return None, "Password must be at least 6 characters"

    if data["location"].lower() not in VALID_LOCATIONS:
        return None, f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"

    try:
        price = float(data["price_per_kw"])
        exp = int(data["experience_years"])
        if price <= 0 or exp < 0:
            raise ValueError
    except (ValueError, TypeError):
        return None, "price_per_kw must be a positive number and experience_years a non-negative integer"

    if find_vendor_by_email(data["email"]):
        return None, "Email already registered"

    vendor = create_vendor(
        company_name=data["company_name"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"]),
        phone=data["phone"],
        location=data["location"].lower(),
        price_per_kw=price,
        experience_years=exp,
    )
    token = create_access_token(identity=f"vendor:{vendor['id']}")
    return {"vendor": public_vendor(vendor), "token": token}, None


def login_vendor(email, password):
    if not email or not password:
        return None, "email and password are required"

    vendor = find_vendor_by_email(email)
    if not vendor or not check_password_hash(vendor["password_hash"], password):
        return None, "Invalid email or password"

    token = create_access_token(identity=f"vendor:{vendor['id']}")
    return {"vendor": public_vendor(vendor), "token": token}, None
