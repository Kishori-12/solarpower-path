from datetime import datetime
import pytz
from firebase_config import get_db
from firebase_admin import firestore

# Get India timezone
IST = pytz.timezone('Asia/Kolkata')

def get_ist_datetime():
    """Get current datetime in India Standard Time (IST)"""
    try:
        return datetime.now(IST)
    except Exception as e:
        print(f"Warning: Failed to get IST time, using UTC: {e}")
        return datetime.utcnow()

# ── Vendor ──────────────────────────────────────────────
def create_vendor(company_name, email, password_hash, phone, location, price_per_kw, experience_years):
    """
    Create a new vendor and store in Firestore.
    
    Returns:
        dict: Vendor data with Firestore document ID
    """
    try:
        db = get_db()
        
        vendor = {
            "company_name": company_name,
            "email": email.lower(),
            "password_hash": password_hash,
            "phone": phone,
            "location": location,
            "price_per_kw": price_per_kw,
            "experience_years": experience_years,
            "status": "pending",          # pending | under_review | approved | rejected
            "rejection_reason": None,
            "rating": 0.0,
            "created_at": get_ist_datetime(),
            "updated_at": get_ist_datetime(),
        }
        
        # Add document and get the reference
        doc_ref = db.collection("vendors").document()
        doc_ref.set(vendor)
        
        # Return vendor with ID
        vendor["id"] = doc_ref.id
        return vendor
        
    except Exception as e:
        print(f"Error creating vendor: {str(e)}")
        raise


def find_vendor_by_email(email):
    """
    Find vendor by email in Firestore.
    
    Returns:
        dict: Vendor data or None if not found
    """
    try:
        db = get_db()
        
        query = db.collection("vendors").where("email", "==", email.lower()).limit(1)
        docs = query.stream()
        
        for doc in docs:
            vendor = doc.to_dict()
            vendor["id"] = doc.id
            return vendor
        
        return None
        
    except Exception as e:
        print(f"Error finding vendor by email: {str(e)}")
        return None


def find_vendor_by_id(vendor_id):
    """
    Find vendor by ID in Firestore.
    
    Returns:
        dict: Vendor data or None if not found
    """
    try:
        db = get_db()
        
        doc = db.collection("vendors").document(vendor_id).get()
        
        if doc.exists:
            vendor = doc.to_dict()
            vendor["id"] = doc.id
            return vendor
        
        return None
        
    except Exception as e:
        print(f"Error finding vendor by ID: {str(e)}")
        return None


def update_vendor(vendor_id, fields: dict):
    """
    Update vendor fields in Firestore.
    
    Returns:
        dict: Updated vendor data or None if not found
    """
    try:
        db = get_db()
        
        # Check if vendor exists
        vendor = find_vendor_by_id(vendor_id)
        if not vendor:
            return None
        
        # Only allow specific fields to be updated
        allowed = {"company_name", "phone", "location", "price_per_kw", "experience_years"}
        update_data = {}
        
        for k, v in fields.items():
            if k in allowed:
                update_data[k] = v
        
        # Add updated timestamp
        update_data["updated_at"] = get_ist_datetime()
        
        # Update document
        db.collection("vendors").document(vendor_id).update(update_data)
        
        # Return updated vendor
        return find_vendor_by_id(vendor_id)
        
    except Exception as e:
        print(f"Error updating vendor: {str(e)}")
        return None


def update_vendor_status(vendor_id, status, rejection_reason=None):
    """
    Update vendor status in Firestore.
    
    Returns:
        dict: Updated vendor data or None if not found
    """
    try:
        db = get_db()
        
        # Check if vendor exists
        vendor = find_vendor_by_id(vendor_id)
        if not vendor:
            return None
        
        update_data = {
            "status": status,
            "rejection_reason": rejection_reason,
            "updated_at": get_ist_datetime()
        }
        
        # Update document
        db.collection("vendors").document(vendor_id).update(update_data)
        
        # Return updated vendor
        return find_vendor_by_id(vendor_id)
        
    except Exception as e:
        print(f"Error updating vendor status: {str(e)}")
        return None


def public_vendor(vendor):
    """
    Return vendor data without sensitive fields.
    """
    return {k: v for k, v in vendor.items() if k != "password_hash"}


def get_all_approved_vendors():
    """
    Get all approved vendors from Firestore.
    
    Returns:
        list: List of public vendor data
    """
    try:
        db = get_db()
        
        query = db.collection("vendors").where("status", "==", "approved")
        docs = query.stream()
        
        vendors = []
        for doc in docs:
            vendor = doc.to_dict()
            vendor["id"] = doc.id
            vendors.append(public_vendor(vendor))
        
        return vendors
        
    except Exception as e:
        print(f"Error getting approved vendors: {str(e)}")
        return []


def get_all_vendors():
    """
    Get all vendors from Firestore (no status filter).

    Returns:
        list: List of vendor dicts
    """
    try:
        db = get_db()

        docs = db.collection("vendors").stream()

        vendors = []
        for doc in docs:
            vendor = doc.to_dict()
            vendor["id"] = doc.id
            vendors.append(vendor)

        return vendors

    except Exception as e:
        print(f"Error getting all vendors: {str(e)}")
        return []


# ── Document ─────────────────────────────────────────────
def save_document(vendor_id, doc_type, filename, original_name, file_size):
    """
    Save document metadata to Firestore documents subcollection.
    
    Returns:
        dict: Document data with Firestore document ID
    """
    try:
        db = get_db()
        
        doc_data = {
            "vendor_id": vendor_id,
            "doc_type": doc_type,           # gst | pan | license | photo
            "filename": filename,
            "original_name": original_name,
            "file_size": file_size,
            "status": "pending",            # pending | verified | rejected
            "uploaded_at": get_ist_datetime(),
        }
        
        # Add document to vendor's documents subcollection
        doc_ref = db.collection("vendors").document(vendor_id).collection("documents").document()
        doc_ref.set(doc_data)
        
        # Return document with ID
        doc_data["id"] = doc_ref.id
        return doc_data
        
    except Exception as e:
        print(f"Error saving document: {str(e)}")
        raise


def get_documents_by_vendor(vendor_id):
    """
    Get all documents for a vendor from Firestore.
    
    Returns:
        list: List of document data
    """
    try:
        db = get_db()
        
        docs = db.collection("vendors").document(vendor_id).collection("documents").stream()
        
        documents = []
        for doc in docs:
            doc_data = doc.to_dict()
            doc_data["id"] = doc.id
            documents.append(doc_data)
        
        return documents
        
    except Exception as e:
        print(f"Error getting vendor documents: {str(e)}")
        return []


def get_all_documents():
    """
    Get all documents from all vendors in Firestore.
    
    Returns:
        list: List of all document data
    """
    try:
        db = get_db()
        
        # Get all vendors
        vendors = db.collection("vendors").stream()
        
        all_documents = []
        for vendor_doc in vendors:
            vendor_id = vendor_doc.id
            
            # Get all documents for this vendor
            docs = db.collection("vendors").document(vendor_id).collection("documents").stream()
            
            for doc in docs:
                doc_data = doc.to_dict()
                doc_data["id"] = doc.id
                all_documents.append(doc_data)
        
        return all_documents
        
    except Exception as e:
        print(f"Error getting all documents: {str(e)}")
        return []
