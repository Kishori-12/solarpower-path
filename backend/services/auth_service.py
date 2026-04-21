import re
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.user_model import create_user, find_user_by_email, public_user

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def register_user(name, email, password):
    if not name or not email or not password:
        return None, "name, email, and password are required"

    if not EMAIL_RE.match(email):
        return None, "Invalid email format"

    if len(password) < 6:
        return None, "Password must be at least 6 characters"

    if find_user_by_email(email):
        return None, "Email already registered"

    user = create_user(name, email.lower(), generate_password_hash(password))
    token = create_access_token(identity=str(user["id"]))
    return {"user": public_user(user), "token": token}, None


def login_user(email, password):
    if not email or not password:
        return None, "email and password are required"

    user = find_user_by_email(email.lower())
    if not user or not check_password_hash(user["password_hash"], password):
        return None, "Invalid email or password"

    token = create_access_token(identity=str(user["id"]))
    return {"user": public_user(user), "token": token}, None
