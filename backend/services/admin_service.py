from models.vendor_model import (
    get_all_vendors,
    public_vendor,
    find_vendor_by_id,
    get_documents_by_vendor,
    get_all_documents,
)
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


def get_all_vendors_admin():
    result = []
    vendors = get_all_vendors()
    for v in vendors:
        vendor_id = v.get("id")
        docs = get_documents_by_vendor(vendor_id) or []
        # Serialize Firestore Timestamps in documents
        serialized_docs = []
        for doc in docs:
            serialized_doc = {}
            for k, val in doc.items():
                if hasattr(val, 'isoformat'):
                    serialized_doc[k] = val.isoformat()
                else:
                    serialized_doc[k] = val
            serialized_docs.append(serialized_doc)
        # Strip password and serialize timestamps in vendor
        clean = {}
        for k, val in v.items():
            if k == "password_hash":
                continue
            if hasattr(val, 'isoformat'):
                clean[k] = val.isoformat()
            else:
                clean[k] = val
        entry = {**clean, "documents": serialized_docs, "doc_count": len(serialized_docs)}
        result.append(entry)
    return result


def get_vendor_with_docs(vendor_id: str):
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return None
    docs = get_documents_by_vendor(vendor_id) or []
    # Serialize Firestore Timestamps
    serialized_docs = []
    for doc in docs:
        serialized_doc = {}
        for k, val in doc.items():
            if hasattr(val, 'isoformat'):
                serialized_doc[k] = val.isoformat()
            else:
                serialized_doc[k] = val
        serialized_docs.append(serialized_doc)
    clean = {}
    for k, val in public_vendor(vendor).items():
        if hasattr(val, 'isoformat'):
            clean[k] = val.isoformat()
        else:
            clean[k] = val
    return {**clean, "documents": serialized_docs}


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

    # ── Vendor status counts ───────────────────────────────
    vendor_status_counts  = Counter(v.get("status") for v in vendors)
    pending_vendors       = vendor_status_counts.get("pending", 0)
    under_review_vendors  = vendor_status_counts.get("under_review", 0)
    approved_vendors      = vendor_status_counts.get("approved", 0)
    rejected_vendors      = vendor_status_counts.get("rejected", 0)

    location_dist = Counter(v.get("location") for v in vendors)

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

    return {
        "overview": {
            "total_users":        total_users,
            "total_vendors":      total_vendors,
            "total_calculations": total_calculations,
            "total_savings_inr":  total_savings,
            "total_co2_offset_kg": total_co2,
            "avg_system_size_kw": avg_system_size,
        },
        "vendor_status": {
            "pending":  pending_vendors + under_review_vendors,
            "approved": approved_vendors,
            "rejected": rejected_vendors,
        },
        "location_distribution": dict(location_dist),
        "registrations": {
            "users":   [{"date": d, "count": c} for d, c in user_reg_by_day.items()],
            "vendors": [{"date": d, "count": c} for d, c in vendor_reg_by_day.items()],
        },
    }
