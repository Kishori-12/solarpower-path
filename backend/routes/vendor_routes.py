from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.vendor_auth_service import register_vendor, login_vendor
from services.vendor_upload_service import upload_document, get_vendor_status
from services.vendor_service import get_vendors, recommend_vendors, recommend_vendor
from models.vendor_model import find_vendor_by_id, update_vendor, public_vendor

vendor_bp = Blueprint("vendor", __name__, url_prefix="/vendor")

VALID_LOCATIONS = ["north", "south", "east", "west", "central"]


def _get_vendor_id():
    identity = get_jwt_identity()          # "vendor:<firestore_doc_id>"
    return identity.split(":", 1)[1]


# ── Auth ─────────────────────────────────────────────────
@vendor_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    print("[VENDOR REGISTER ROUTE] Received request body:", data)
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    result, error = register_vendor(data)
    if error:
        print(f"[VENDOR REGISTER ROUTE] Registration error: {error}")
        return jsonify({"error": error}), 400
    
    print("[VENDOR REGISTER ROUTE] Registration successful")
    return jsonify({"success": True, "data": result}), 201


@vendor_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    result, error = login_vendor(data.get("email"), data.get("password"))
    if error:
        return jsonify({"error": error}), 401
    return jsonify({"success": True, "data": result}), 200


# ── Documents ─────────────────────────────────────────────
@vendor_bp.route("/upload-documents", methods=["POST"])
@jwt_required()
def upload_docs():
    try:
        vendor_id = _get_vendor_id()

        print("FILES:", request.files)
        print("FORM:", request.form)

        file = request.files.get("file")
        doc_type = request.form.get("doc_type")

        print(f"[UPLOAD] Vendor {vendor_id} uploading doc_type={doc_type}, file={file.filename if file else 'None'}")

        if not file:
            return jsonify({"error": "No file provided"}), 400
        if not doc_type:
            return jsonify({"error": "doc_type is required"}), 400

        doc, error = upload_document(vendor_id, file, doc_type)
        if error:
            print(f"[UPLOAD] Error for vendor {vendor_id}: {error}")
            if "Cloudinary" in error or "not configured" in error:
                return jsonify({"error": error}), 500
            return jsonify({"error": error}), 400

        print(f"[UPLOAD] Successfully uploaded doc for vendor {vendor_id}")
        return jsonify({"success": True, "data": doc}), 201

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": "Internal server error"}), 500


# ── Status ────────────────────────────────────────────────
@vendor_bp.route("/status", methods=["GET"])
@jwt_required()
def status():
    vendor_id = _get_vendor_id()
    result, error = get_vendor_status(vendor_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify({"success": True, "data": result}), 200


# ── Profile ───────────────────────────────────────────────
@vendor_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    vendor_id = _get_vendor_id()
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "data": public_vendor(vendor)}), 200


@vendor_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    vendor_id = _get_vendor_id()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    if "location" in data and data["location"].lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400

    vendor = update_vendor(vendor_id, data)
    if not vendor:
        return jsonify({"error": "Vendor not found"}), 404
    return jsonify({"success": True, "data": public_vendor(vendor)}), 200


# ── Public listing (keep existing routes working) ─────────
@vendor_bp.route("/list", methods=["GET"])
def list_vendors():
    location = request.args.get("location")
    all_vendors = get_vendors()
    if location:
        if location.lower() not in VALID_LOCATIONS:
            return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400
        filtered = [v for v in all_vendors if location.lower() in v["locations"]]
        return jsonify({"success": True, "count": len(filtered), "data": filtered}), 200
    return jsonify({"success": True, "count": len(all_vendors), "data": all_vendors}), 200


@vendor_bp.route("/recommend", methods=["GET"])
def recommend():
    location = request.args.get("location")
    capacity_kw = request.args.get("capacity_kw")
    if not location:
        return jsonify({"error": "location is required"}), 400
    if location.lower() not in VALID_LOCATIONS:
        return jsonify({"error": f"Invalid location. Must be one of: {', '.join(VALID_LOCATIONS)}"}), 400
    try:
        capacity_kw = float(capacity_kw) if capacity_kw else None
    except ValueError:
        return jsonify({"error": "capacity_kw must be a number"}), 400
    results = recommend_vendors(location, capacity_kw)
    return jsonify({"success": True, "location": location, "top_vendors": results}), 200


# ── AI-based Recommendation ───────────────────────────────
@vendor_bp.route("/recommend/vendor", methods=["POST"])
def recommend_ai():
    """
    AI-based vendor recommendation using pre-trained ML model.
    
    Expected JSON input:
    {
        "price": 48000.0,
        "rating": 4.5,
        "warranty": 10
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    # Validate required fields
    price = data.get("price")
    rating = data.get("rating")
    warranty = data.get("warranty")
    
    if price is None or rating is None or warranty is None:
        return jsonify({
            "error": "Missing required fields",
            "required": ["price", "rating", "warranty"]
        }), 400
    
    # Call the AI recommendation function
    result = recommend_vendor(price, rating, warranty)
    
    if result.get("success"):
        return jsonify(result), 200
    else:
        return jsonify(result), 400
