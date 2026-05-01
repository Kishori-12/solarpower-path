from models.user_model import _users, _calculations
from models.vendor_model import (
    get_all_vendors,
    public_vendor,
    find_vendor_by_id,
    get_documents_by_vendor,
    get_all_documents,
)
from models.scheme_model import get_all_schemes
from collections import Counter


def get_all_users():
    return [
        {k: v for k, v in u.items() if k != "password_hash"}
        for u in _users
    ]


def get_all_vendors_admin():
    result = []
    # Fetch vendors from Firestore (all vendors)
    vendors = get_all_vendors()
    for v in vendors:
        # v is already public_vendor-applied in get_all_approved_vendors()
        docs = get_documents_by_vendor(v.get("id")) or []
        entry = {**v, "documents": docs, "doc_count": len(docs)}
        result.append(entry)
    return result


def get_vendor_with_docs(vendor_id: int):
    vendor = find_vendor_by_id(vendor_id)
    if not vendor:
        return None
    docs = get_documents_by_vendor(vendor_id) or []
    return {**public_vendor(vendor), "documents": docs}


def get_analytics():
    total_users = len(_users)
    vendors = get_all_vendors()
    total_vendors = len(vendors)
    total_calculations = len(_calculations)
    total_schemes = len(get_all_schemes())

    # Vendor status counts (from approved vendors only)
    vendor_status_counts = Counter(v.get("status") for v in vendors)
    pending_vendors = vendor_status_counts.get("pending", 0)
    approved_vendors = vendor_status_counts.get("approved", 0)
    rejected_vendors = vendor_status_counts.get("rejected", 0)

    # Vendor location distribution
    location_dist = Counter(v.get("location") for v in vendors)

    # Total savings across all calculations
    total_savings = sum(
        c.get("results", {}).get("financials", {}).get("annual_savings_inr", 0)
        for c in _calculations
    )

    # Total CO2 offset
    total_co2 = sum(
        c.get("results", {}).get("environment", {}).get("co2_offset_kg_per_year", 0)
        for c in _calculations
    )

    # Average system size
    sizes = [
        c.get("results", {}).get("system", {}).get("recommended_capacity_kw", 0)
        for c in _calculations
    ]
    avg_system_size = round(sum(sizes) / len(sizes), 2) if sizes else 0

    # Registrations by date (last 7 days buckets)
    from datetime import datetime, timedelta
    import pytz
    
    IST = pytz.timezone('Asia/Kolkata')
    try:
        today = datetime.now(IST).date()
    except Exception as e:
        print(f"Warning: Failed to get IST date, using UTC: {e}")
        today = datetime.utcnow().date()
    user_reg_by_day = {}
    for i in range(6, -1, -1):
        day = str(today - timedelta(days=i))
        user_reg_by_day[day] = 0
    for u in _users:
        day = u["created_at"][:10]
        if day in user_reg_by_day:
            user_reg_by_day[day] += 1

    vendor_reg_by_day = {}
    for i in range(6, -1, -1):
        day = str(today - timedelta(days=i))
        vendor_reg_by_day[day] = 0
    for v in vendors:
        day = v.get("created_at")
        # created_at may be a Timestamp or ISO string
        if isinstance(day, str):
            day_str = day[:10]
        else:
            try:
                day_str = str(day.date())
            except Exception:
                day_str = str(day)
        if day_str in vendor_reg_by_day:
            vendor_reg_by_day[day_str] += 1

    return {
        "overview": {
            "total_users": total_users,
            "total_vendors": total_vendors,
            "total_calculations": total_calculations,
            "total_schemes": total_schemes,
            "total_savings_inr": total_savings,
            "total_co2_offset_kg": total_co2,
            "avg_system_size_kw": avg_system_size,
        },
        "vendor_status": {
            "pending": pending_vendors,
            "approved": approved_vendors,
            "rejected": rejected_vendors,
        },
        "location_distribution": dict(location_dist),
        "registrations": {
            "users": [{"date": d, "count": c} for d, c in user_reg_by_day.items()],
            "vendors": [{"date": d, "count": c} for d, c in vendor_reg_by_day.items()],
        },
    }
