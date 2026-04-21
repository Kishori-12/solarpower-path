import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from routes.auth_routes import auth_bp
from routes.solar_routes import solar_bp
from routes.vendor_routes import vendor_bp
from routes.scheme_routes import scheme_bp
from routes.user_routes import user_bp
from routes.admin_routes import admin_bp

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "solarwise-secret-key-change-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(solar_bp)
app.register_blueprint(vendor_bp)
app.register_blueprint(scheme_bp)
app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"error": "File too large. Maximum size is 5 MB"}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


@app.route("/", methods=["GET"])
def health_check():
    routes = [str(rule) for rule in app.url_map.iter_rules()]
    return jsonify({"status": "SolarWise API is running", "routes": routes}), 200


if __name__ == "__main__":
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    print("\n Registered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {list(rule.methods - {'HEAD','OPTIONS'})} {rule}")
    print()
    app.run(debug=True, port=5000)
