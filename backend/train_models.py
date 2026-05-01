"""
Script to train and save ML models for vendor and scheme recommendations.
Run this once to generate .pkl files.
"""
import joblib
import numpy as np
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder

# ============================================================================
# VENDOR RECOMMENDATION MODEL
# ============================================================================
print("Training Vendor Recommendation Model...")

np.random.seed(42)
n_samples = 100

price = np.random.uniform(50000, 300000, n_samples)
rating = np.random.uniform(3.0, 5.0, n_samples)
warranty = np.random.uniform(1, 10, n_samples)

X_vendor = np.column_stack([price, rating, warranty])

vendor_score = (
    (300000 - price) / 300000 * 40 +
    (rating / 5.0) * 40 +
    (warranty / 10.0) * 20
)

vendor_model = DecisionTreeRegressor(max_depth=5, random_state=42)
vendor_model.fit(X_vendor, vendor_score)

joblib.dump(vendor_model, "models/vendor_recommendation_model.pkl")
print("[OK] Vendor model saved as 'vendor_recommendation_model.pkl'")

# ============================================================================
# SCHEME RECOMMENDATION MODEL
# ============================================================================
print("Training Scheme Recommendation Model...")

locations = ["north", "south", "east", "west", "central"]
location_encoder = LabelEncoder()
location_encoder.fit(locations)

n_schemes = 80

location_encoded = np.random.choice(location_encoder.transform(locations), n_schemes)
budget = np.random.uniform(100000, 500000, n_schemes)
capacity = np.random.uniform(1, 10, n_schemes)

X_scheme = np.column_stack([location_encoded, budget, capacity])

scheme_score = np.zeros(n_schemes)

for i in range(n_schemes):
    base_score = 3.0
    if 100000 <= budget[i] <= 300000:
        base_score = 4.0
    if budget[i] > 300000:
        base_score = 4.5
    if location_encoded[i] in [0, 1]:
        base_score += 0.3
    scheme_score[i] = min(5.0, base_score)

scheme_model = DecisionTreeClassifier(max_depth=5, random_state=42)
scheme_model.fit(X_scheme, np.round(scheme_score).astype(int))

joblib.dump(scheme_model, "models/scheme_recommendation_model.pkl")
joblib.dump(location_encoder, "models/location_encoder.pkl")
print("[OK] Scheme model saved as 'scheme_recommendation_model.pkl'")
print("[OK] Location encoder saved as 'location_encoder.pkl'")

print("\n[OK] All models trained and saved successfully!")
print("\nUsage in Flask app:")
print("  - Load models using: joblib.load('models/vendor_recommendation_model.pkl')")
print("  - Load encoder using: joblib.load('models/location_encoder.pkl')")
