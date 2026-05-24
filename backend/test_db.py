import sys
sys.path.insert(0, '.')

print("=== Testing Firebase Connection ===")
try:
    from firebase_config import get_db
    db = get_db()
    print("[OK] Firebase connected")

    vendors = list(db.collection('vendors').where('status', '==', 'approved').stream())
    print(f"[OK] Approved vendors: {len(vendors)}")
    for v in vendors[:3]:
        d = v.to_dict()
        print(f"     {d.get('name')} | rating={d.get('rating')} | locations={d.get('locations')}")

    schemes = list(db.collection('schemes').stream())
    print(f"[OK] Schemes: {len(schemes)}")
    for s in schemes:
        d = s.to_dict()
        print(f"     {d.get('name')} | subsidy={d.get('subsidy_percent')}%")
except Exception as e:
    print(f"[ERROR] Firebase: {e}")

print("\n=== Testing Vendor Service ===")
try:
    from services.vendor_service import recommend_vendors, get_vendors
    vendors = get_vendors()
    print(f"[OK] get_vendors(): {len(vendors)} vendors")
    recs = recommend_vendors("south", budget=150000, top_n=3)
    print(f"[OK] recommend_vendors(south, 150000): {len(recs)} results")
    for r in recs:
        print(f"     {r.get('name')} | score={r.get('score')} | within_budget={r.get('within_budget')}")
except Exception as e:
    print(f"[ERROR] vendor_service: {e}")

print("\n=== Testing Scheme Service ===")
try:
    from services.scheme_service import recommend_scheme
    result = recommend_scheme("south", 200000, 3)
    print(f"[OK] recommend_scheme: {result.get('recommended_scheme')}")
    print(f"     subsidy={result.get('estimated_subsidy')} | eligibility={result.get('eligibility')}")
except Exception as e:
    print(f"[ERROR] scheme_service: {e}")

print("\n=== All checks done ===")
