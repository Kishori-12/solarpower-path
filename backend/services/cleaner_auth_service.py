from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.cleaner_model import create_cleaner, find_cleaner_by_email, public_cleaner

def register_cleaner(data):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not name or not email or not password:
        return None, "Name, email, and password are required"
    if find_cleaner_by_email(email):
        return None, "Email already exists"
    
    data["password_hash"] = generate_password_hash(password)
    new_cleaner = create_cleaner(data)
    token = create_access_token(identity=f"cleaner:{new_cleaner['id']}")
    return {"cleaner": public_cleaner(new_cleaner), "token": token}, None

def login_cleaner(email, password):
    if not email or not password:
        return None, "Email and password are required"
    cleaner = find_cleaner_by_email(email)
    if not cleaner or not check_password_hash(cleaner["password_hash"], password):
        return None, "Invalid credentials"
    token = create_access_token(identity=f"cleaner:{cleaner['id']}")
    return {"cleaner": public_cleaner(cleaner), "token": token}, None
