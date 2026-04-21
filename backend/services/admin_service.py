from models.user_model import _users, _calculations
from models.vendor_model import _vendors, _documents, public_vendor
from models.scheme_model import get_all_schemes
from collections import Counter


def get_all_users():
    return [
        {k: v for k, v in u.items() if k != "password_hash"}
        for u in _users
    ]


def get_all_vendors_admin():
    result = []
    for v in _vendors:
        docs = [d for d in _documents if d["vendor_id"] == v["id"]]
        entry = {**public_vendor(v), "documents": docs, "doc_count": len(docs)}
        result.append(entry)
    return result


def get_vendor_with_docs(vendor_id: int):
    vendor = next((v for v in _vendors if v["id"] == vendor_id), None)
    if not vendor:
        return None
    docs = [d for d in _documents if d["vendor_id"] == vendor_id]
    return {**public_vendor(vendor), "documents": docs}


def get_analytics():
    total_users = len(_users)
    total_vendors = len(_vendors)
    total_calculations = len(_calculations)
    total_schemes = len(get_all_schemes())

    vendor_status_counts = Counter(v["status"] for v in _vendors)
    pending_vendors = vendor_status_counts.get("pending", 0)
    approved_vendors = vendor_status_counts.get("approved", 0)
    rejected_vendors = vendor_status_counts.get("rejected", 0)

    # Vendor location distribution
    location_dist = Counter(v["location"] for v in _vendors)

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
    for v in _vendors:
        day = v["created_at"][:10]
        if day in vendor_reg_by_day:
            vendor_reg_by_day[day] += 1

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
