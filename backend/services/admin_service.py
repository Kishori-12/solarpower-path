from models.vendor_model import (
    get_all_vendors,
    public_vendor,
    find_vendor_by_id,
    get_documents_by_vendor,
    get_all_documents,
)
from models.cleaner_model import get_all_cleaners
from models.scheme_model import get_all_schemes
from firebase_config import get_db
from collections import Counter


def get_all_users():
    try:
        db = get_db()
        docs = db.collection("users").stream()
        users = []
        for doc in docs:
            u = doc.to_dict()
            u["id"] = doc.id
            users.append({k: v for k, v in u.items() if k != "password_hash"})
        return users
    except Exception as e:
        print(f"Error getting users: {e}")
        return []


def _serialize(val):
    """Convert Firestore Timestamps and other non-JSON types to strings."""
    if val is None:
        return None
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    return val


def _normalize_vendor(v: dict) -> dict:
    """Normalize both old-schema (name/price_per_kw_inr/locations) and
    new-schema (company_name/price_per_kw/location) vendors into one shape."""
    company_name = v.get("company_name") or v.get("name") or ""
    email        = v.get("email") or ""
    phone        = v.get("phone") or ""
    # location: new schema has string, old schema has array
    location_raw = v.get("location") or ""
    if not location_raw:
        locs = v.get("locations") or []
        location_raw = locs[0] if locs else ""
    price = v.get("price_per_kw") or v.get("price_per_kw_inr") or 0
    return {
        **{k: _serialize(val) for k, val in v.items() if k not in ("password_hash",)},
        "company_name":    company_name,
        "email":           email,
        "phone":           phone,
        "location":        str(location_raw).lower() if location_raw else "",
        "price_per_kw":    float(price),
        "experience_years": v.get("experience_years") or 0,
        "rating":          v.get("rating") or 0.0,
        "status":          v.get("status") or "pending",
        "rejection_reason": v.get("rejection_reason"),
        "created_at":      _serialize(v.get("created_at")),
        "updated_at":      _serialize(v.get("updated_at")),
    }


def get_all_vendors_admin():
    result = []
    vendors = get_all_vendors()
    for v in vendors:
        vendor_id = v.get("id")
        docs = get_documents_by_vendor(vendor_id) or []
        serialized_docs = [
            {k: _serialize(val) for k, val in doc.items()}
            for doc in docs
        ]
        clean = _normalize_vendor(v)
        clean["documents"] = serialized_docs
        clean["doc_count"] = len(serialized_docs)
        result.append(clean)
    return result


def get_vendor_with_docs(vendor_id: str):
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return None
    docs = get_documents_by_vendor(vendor_id) or []
    serialized_docs = [
        {k: _serialize(val) for k, val in doc.items()}
        for doc in docs
    ]
    clean = _normalize_vendor(vendor)
    clean["documents"] = serialized_docs
    clean["doc_count"] = len(serialized_docs)
    return clean


def get_analytics():
    from datetime import datetime, timedelta
    import pytz

    db = get_db()
    IST = pytz.timezone('Asia/Kolkata')
    try:
        today = datetime.now(IST).date()
    except Exception:
        today = datetime.utcnow().date()

    # ── Counts from Firestore ──────────────────────────────
    try:
        users = [doc.to_dict() | {"id": doc.id} for doc in db.collection("users").stream()]
    except Exception:
        users = []

    try:
        calculations = [doc.to_dict() for doc in db.collection("calculations").stream()]
    except Exception:
        calculations = []

    vendors = get_all_vendors()

    total_users        = len(users)
    total_vendors      = len(vendors)
    total_calculations = len(calculations)

    try:
        cleaners = get_all_cleaners()
        total_cleaners = len(cleaners)
    except Exception:
        total_cleaners = 0

    try:
        schemes = get_all_schemes()
        total_schemes = len(schemes)
    except Exception:
        total_schemes = 0

    # ── Vendor status counts ───────────────────────────────
    vendor_status_counts  = Counter(v.get("status") for v in vendors)
    pending_vendors       = vendor_status_counts.get("pending", 0)
    under_review_vendors  = vendor_status_counts.get("under_review", 0)
    approved_vendors      = vendor_status_counts.get("approved", 0)
    rejected_vendors      = vendor_status_counts.get("rejected", 0)

    location_dist = Counter(v.get("location") or "unknown" for v in vendors)

    # ── Savings & CO2 from calculations ───────────────────
    total_savings = sum(
        c.get("results", {}).get("financials", {}).get("annual_savings_inr", 0)
        for c in calculations
    )
    total_co2 = sum(
        c.get("results", {}).get("environment", {}).get("co2_offset_kg_per_year", 0)
        for c in calculations
    )
    sizes = [
        c.get("results", {}).get("system", {}).get("recommended_capacity_kw", 0)
        for c in calculations
    ]
    avg_system_size = round(sum(sizes) / len(sizes), 2) if sizes else 0

    # ── Registrations last 7 days ──────────────────────────
    user_reg_by_day = {str(today - timedelta(days=i)): 0 for i in range(6, -1, -1)}
    for u in users:
        raw = u.get("created_at", "")
        day_str = raw[:10] if isinstance(raw, str) else ""
        if not day_str:
            try: day_str = str(raw.date())
            except Exception: pass
        if day_str in user_reg_by_day:
            user_reg_by_day[day_str] += 1

    vendor_reg_by_day = {str(today - timedelta(days=i)): 0 for i in range(6, -1, -1)}
    for v in vendors:
        raw = v.get("created_at")
        day_str = raw[:10] if isinstance(raw, str) else ""
        if not day_str:
            try: day_str = str(raw.date())
            except Exception: pass
        if day_str in vendor_reg_by_day:
            vendor_reg_by_day[day_str] += 1

    # Filter out None/unknown keys from location distribution
    clean_location_dist = {str(k): v for k, v in location_dist.items() if k and k != "unknown"}

    return {
        "overview": {
            "total_users":         total_users,
            "total_vendors":       total_vendors,
            "total_calculations":  total_calculations,
            "total_schemes":       total_schemes,
            "total_cleaners":      total_cleaners,
            "total_savings_inr":   float(total_savings),
            "total_co2_offset_kg": float(total_co2),
            "avg_system_size_kw":  avg_system_size,
        },
        "vendor_status": {
            "pending":  pending_vendors + under_review_vendors,
            "approved": approved_vendors,
            "rejected": rejected_vendors,
        },
        "location_distribution": clean_location_dist,
        "registrations": {
            "users":   [{"date": d, "count": c} for d, c in user_reg_by_day.items()],
            "vendors": [{"date": d, "count": c} for d, c in vendor_reg_by_day.items()],
        },
    }
