import os
import uuid
import cloudinary.uploader
from werkzeug.utils import secure_filename
from cloudinary_config import is_configured
from models.vendor_model import save_document, get_documents_by_vendor, find_vendor_by_id, update_vendor_status

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024   # 5 MB
VALID_DOC_TYPES = {"gst", "pan", "license", "photo"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def upload_to_cloudinary(file, doc_type, vendor_id):
    try:
        public_id = f"vendor_docs/{vendor_id}/{doc_type}_{uuid.uuid4().hex[:8]}"

        result = cloudinary.uploader.upload(
            file,
            public_id=public_id,
            folder=f"vendor_docs/{vendor_id}",
            resource_type="auto",
            overwrite=False,
            tags=[f"vendor_{vendor_id}", f"doc_type_{doc_type}"]
        )

        print(f"[Cloudinary] Uploaded: {result['public_id']} → {result['secure_url']}")
        return result["secure_url"], None

    except Exception as e:
        print("Cloudinary error:", str(e))
        return None, f"Cloudinary upload failed: {str(e)}"


def upload_document(vendor_id, file, doc_type):
    if not file or file.filename == "":
        return None, "No file provided"

    if not doc_type:
        return None, "doc_type is required"

    if doc_type not in VALID_DOC_TYPES:
        return None, f"Invalid doc_type. Must be one of: {', '.join(VALID_DOC_TYPES)}"

    if not _allowed(file.filename):
        return None, "Only PDF, PNG, JPG, JPEG files are allowed"

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return None, "File size must be under 5 MB"

    if not is_configured():
        return None, "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"

    file_url, upload_error = upload_to_cloudinary(file, doc_type, vendor_id)
    if upload_error:
        return None, upload_error

    try:
        doc = save_document(
            vendor_id=vendor_id,
            doc_type=doc_type,
            filename=file_url,
            original_name=secure_filename(file.filename),
            file_size=size,
        )
    except Exception as e:
        print("ERROR:", str(e))
        return None, f"Failed to save document metadata: {str(e)}"

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
