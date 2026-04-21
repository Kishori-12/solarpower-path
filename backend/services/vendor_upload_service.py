import os
import uuid
from werkzeug.utils import secure_filename
from models.vendor_model import save_document, get_documents_by_vendor, find_vendor_by_id, update_vendor_status

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024   # 5 MB
VALID_DOC_TYPES = {"gst", "pan", "license", "photo"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def upload_document(vendor_id, file, doc_type):
    if not file or file.filename == "":
        return None, "No file provided"

    if doc_type not in VALID_DOC_TYPES:
        return None, f"Invalid doc_type. Must be one of: {', '.join(VALID_DOC_TYPES)}"

    if not _allowed(file.filename):
        return None, "Only PDF, PNG, JPG, JPEG files are allowed"

    # Check file size
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return None, "File size must be under 5 MB"

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"{vendor_id}_{doc_type}_{uuid.uuid4().hex[:8]}.{ext}"
    safe_name = secure_filename(unique_name)
    file.save(os.path.join(UPLOAD_FOLDER, safe_name))

    doc = save_document(
        vendor_id=vendor_id,
        doc_type=doc_type,
        filename=safe_name,
        original_name=secure_filename(file.filename),
        file_size=size,
    )

    # Auto-approve if all 4 doc types uploaded (simulate verification workflow)
    _check_and_update_status(vendor_id)

    return doc, None


def _check_and_update_status(vendor_id):
    docs = get_documents_by_vendor(vendor_id)
    uploaded_types = {d["doc_type"] for d in docs}
    if VALID_DOC_TYPES.issubset(uploaded_types):
        update_vendor_status(vendor_id, "approved")


def get_vendor_status(vendor_id):
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return None, "Vendor not found"

    docs = get_documents_by_vendor(vendor_id)
    uploaded_types = {d["doc_type"] for d in docs}
    missing_docs = list(VALID_DOC_TYPES - uploaded_types)

    return {
        "vendor_id": vendor_id,
        "status": vendor["status"],
        "rejection_reason": vendor["rejection_reason"],
        "documents": docs,
        "missing_documents": missing_docs,
        "verification_progress": f"{len(uploaded_types)}/{len(VALID_DOC_TYPES)} documents uploaded",
    }, None
