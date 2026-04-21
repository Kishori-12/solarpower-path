from datetime import datetime

_vendors = []
_documents = []
_vendor_id_counter = 1
_doc_id_counter = 1


# ── Vendor ──────────────────────────────────────────────
def create_vendor(company_name, email, password_hash, phone, location, price_per_kw, experience_years):
    global _vendor_id_counter
    vendor = {
        "id": _vendor_id_counter,
        "company_name": company_name,
        "email": email.lower(),
        "password_hash": password_hash,
        "phone": phone,
        "location": location,
        "price_per_kw": price_per_kw,
        "experience_years": experience_years,
        "status": "pending",          # pending | approved | rejected
        "rejection_reason": None,
        "rating": 0.0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    _vendors.append(vendor)
    _vendor_id_counter += 1
    return vendor


def find_vendor_by_email(email):
    return next((v for v in _vendors if v["email"] == email.lower()), None)


def find_vendor_by_id(vendor_id):
    return next((v for v in _vendors if v["id"] == vendor_id), None)


def update_vendor(vendor_id, fields: dict):
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return None
    allowed = {"company_name", "phone", "location", "price_per_kw", "experience_years"}
    for k, v in fields.items():
        if k in allowed:
            vendor[k] = v
    vendor["updated_at"] = datetime.utcnow().isoformat()
    return vendor


def update_vendor_status(vendor_id, status, rejection_reason=None):
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return None
    vendor["status"] = status
    vendor["rejection_reason"] = rejection_reason
    vendor["updated_at"] = datetime.utcnow().isoformat()
    return vendor


def public_vendor(vendor):
    return {k: v for k, v in vendor.items() if k != "password_hash"}


def get_all_approved_vendors():
    return [public_vendor(v) for v in _vendors if v["status"] == "approved"]


# ── Document ─────────────────────────────────────────────
def save_document(vendor_id, doc_type, filename, original_name, file_size):
    global _doc_id_counter
    doc = {
        "id": _doc_id_counter,
        "vendor_id": vendor_id,
        "doc_type": doc_type,           # gst | pan | license | photo
        "filename": filename,
        "original_name": original_name,
        "file_size": file_size,
        "status": "pending",            # pending | verified | rejected
        "uploaded_at": datetime.utcnow().isoformat(),
    }
    _documents.append(doc)
    _doc_id_counter += 1
    return doc


def get_documents_by_vendor(vendor_id):
    return [d for d in _documents if d["vendor_id"] == vendor_id]


def get_all_documents():
    return _documents
