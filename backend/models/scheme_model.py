from datetime import datetime
import pytz
from firebase_config import get_db

# Get India timezone
IST = pytz.timezone('Asia/Kolkata')

def get_ist_datetime():
    """Get current datetime in India Standard Time (IST)"""
    try:
        return datetime.now(IST)
    except Exception as e:
        print(f"Warning: Failed to get IST time, using UTC: {e}")
        return datetime.utcnow()

# Initial schemes to seed Firestore (only used on first run)
_INITIAL_SCHEMES = [
    {
        "id": 1,
        "name": "PM Surya Ghar Muft Bijli Yojana",
        "provider": "Government of India",
        "subsidy_percent": 40,
        "max_subsidy_inr": 78000,
        "eligibility": "Residential households",
        "link": "https://pmsuryaghar.gov.in",
        "active": True,
    },
    {
        "id": 2,
        "name": "MNRE Rooftop Solar Scheme",
        "provider": "Ministry of New and Renewable Energy",
        "subsidy_percent": 30,
        "max_subsidy_inr": 60000,
        "eligibility": "Residential and commercial",
        "link": "https://mnre.gov.in",
        "active": True,
    },
    {
        "id": 3,
        "name": "State Solar Subsidy",
        "provider": "State Government",
        "subsidy_percent": 20,
        "max_subsidy_inr": 30000,
        "eligibility": "All categories",
        "link": "https://example-state-solar.gov.in",
        "active": True,
    },
]

def _initialize_schemes():
    """
    Initialize Firestore schemes collection with default schemes if empty.
    Called on first app startup.
    """
    try:
        db = get_db()
        
        # Check if schemes collection already has documents
        docs = db.collection("schemes").limit(1).stream()
        
        if not any(docs):
            # Collection is empty, add initial schemes
            for scheme in _INITIAL_SCHEMES:
                scheme_with_timestamps = {
                    **scheme,
                    "created_at": get_ist_datetime(),
                    "updated_at": get_ist_datetime(),
                }
                db.collection("schemes").document(str(scheme["id"])).set(scheme_with_timestamps)
            print("✓ Initial schemes loaded into Firestore")
            
    except Exception as e:
        print(f"⚠ Error initializing schemes: {str(e)}")

def get_all_schemes(active_only=False):
    """
    Get all schemes from Firestore.
    
    Args:
        active_only (bool): If True, return only active schemes
    
    Returns:
        list: List of scheme data
    """
    try:
        db = get_db()
        
        if active_only:
            query = db.collection("schemes").where("active", "==", True)
        else:
            query = db.collection("schemes")
        
        docs = query.stream()
        
        schemes = []
        for doc in docs:
            scheme = doc.to_dict()
            scheme["id"] = doc.id
            schemes.append(scheme)
        
        return schemes
        
    except Exception as e:
        print(f"Error getting schemes: {str(e)}")
        return []


def get_scheme_by_id(scheme_id):
    """
    Get a specific scheme by ID from Firestore.
    
    Args:
        scheme_id (int or str): Scheme ID
    
    Returns:
        dict: Scheme data or None if not found
    """
    try:
        db = get_db()
        
        doc = db.collection("schemes").document(str(scheme_id)).get()
        
        if doc.exists:
            scheme = doc.to_dict()
            scheme["id"] = doc.id
            return scheme
        
        return None
        
    except Exception as e:
        print(f"Error getting scheme by ID: {str(e)}")
        return None


def create_scheme(data: dict):
    """
    Create a new scheme in Firestore.
    
    Returns:
        dict: Scheme data with Firestore document ID
    """
    try:
        db = get_db()
        
        scheme = {
            "name": data["name"],
            "provider": data["provider"],
            "subsidy_percent": int(data["subsidy_percent"]),
            "max_subsidy_inr": int(data["max_subsidy_inr"]),
            "eligibility": data["eligibility"],
            "link": data.get("link", ""),
            "active": data.get("active", True),
            "created_at": get_ist_datetime(),
            "updated_at": get_ist_datetime(),
        }
        
        # Add document and get the reference
        doc_ref = db.collection("schemes").document()
        doc_ref.set(scheme)
        
        # Return scheme with ID
        scheme["id"] = doc_ref.id
        return scheme
        
    except Exception as e:
        print(f"Error creating scheme: {str(e)}")
        raise


def update_scheme(scheme_id, data: dict):
    """
    Update a scheme in Firestore.
    
    Returns:
        dict: Updated scheme data or None if not found
    """
    try:
        db = get_db()
        
        # Check if scheme exists
        scheme = get_scheme_by_id(scheme_id)
        if not scheme:
            return None
        
        # Only allow specific fields to be updated
        allowed = {"name", "provider", "subsidy_percent", "max_subsidy_inr", "eligibility", "link", "active"}
        update_data = {}
        
        for k, v in data.items():
            if k in allowed:
                update_data[k] = v
        
        # Add updated timestamp
        update_data["updated_at"] = get_ist_datetime()
        
        # Update document
        db.collection("schemes").document(str(scheme_id)).update(update_data)
        
        # Return updated scheme
        return get_scheme_by_id(scheme_id)
        
    except Exception as e:
        print(f"Error updating scheme: {str(e)}")
        return None


def delete_scheme(scheme_id):
    """
    Delete a scheme from Firestore.
    
    Returns:
        bool: True if deleted, False if not found
    """
    try:
        db = get_db()
        
        # Check if scheme exists
        scheme = get_scheme_by_id(scheme_id)
        if not scheme:
            return False
        
        # Delete document
        db.collection("schemes").document(str(scheme_id)).delete()
        
        return True
        
    except Exception as e:
        print(f"Error deleting scheme: {str(e)}")
        return False
