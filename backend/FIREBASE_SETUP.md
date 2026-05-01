# Firebase Firestore Integration Setup Guide

## Overview
Your Flask backend has been successfully integrated with Firebase Firestore. All existing APIs remain unchanged. In-memory storage has been replaced with Firestore collections.

## What Was Changed

### ✅ Files Created
- **`backend/firebase_config.py`** - Firebase Admin SDK initialization module

### ✅ Files Updated
- **`backend/models/vendor_model.py`** - Now uses Firestore collection "vendors"
- **`backend/models/scheme_model.py`** - Now uses Firestore collection "schemes"
- **`backend/app.py`** - Added Firebase initialization on startup
- **`backend/requirements.txt`** - Added `firebase-admin==6.5.0`

### ✅ Files NOT Modified (Preserved)
- All route files (routes/*.py)
- All service files (services/*.py)
- All AI model logic
- All existing API endpoints

---

## Setup Instructions

### Step 1: Get Firebase Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Settings** → **Service Accounts** → **Python**
4. Click **Generate New Private Key**
5. Save the JSON file as `firebase-service-account.json`
6. Place it in the **`backend/`** folder

### Step 2: Ensure Firestore Database Exists

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode** (or test mode for development)
4. Select your region
5. Click **Enable**

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Run the Backend

```bash
python app.py
```

You should see:
```
✓ Firebase Firestore initialized
✓ Initial schemes loaded into Firestore
✓ Vendor recommendation model loaded
✓ Scheme recommendation model loaded
 * Running on http://localhost:5000
```

---

## Firestore Structure

### Collections Created Automatically

#### `vendors` Collection
```json
{
  "company_name": "SunPower India",
  "email": "vendor@example.com",
  "password_hash": "hashed_password",
  "phone": "+91-9876543210",
  "location": "north",
  "price_per_kw": 48000,
  "experience_years": 10,
  "status": "approved",
  "rejection_reason": null,
  "rating": 4.8,
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

**Subcollection: `vendors/{vendorId}/documents`**
```json
{
  "vendor_id": "docId123",
  "doc_type": "gst|pan|license|photo",
  "filename": "document.pdf",
  "original_name": "GST_Certificate.pdf",
  "file_size": 245000,
  "status": "pending|verified|rejected",
  "uploaded_at": "Timestamp"
}
```

#### `schemes` Collection
```json
{
  "id": 1,
  "name": "PM Surya Ghar Muft Bijli Yojana",
  "provider": "Government of India",
  "subsidy_percent": 40,
  "max_subsidy_inr": 78000,
  "eligibility": "Residential households",
  "link": "https://pmsuryaghar.gov.in",
  "active": true,
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

---

## API Endpoints (No Changes)

All existing endpoints work the same way:

### Vendor Endpoints
```
POST   /vendor/register              - Register vendor
POST   /vendor/login                 - Login vendor
POST   /vendor/recommend/vendor      - AI vendor recommendation
GET    /vendor/list                  - List vendors
GET    /vendor/recommend             - Rule-based recommendation
GET    /vendor/profile               - Get vendor profile
PUT    /vendor/profile               - Update vendor profile
POST   /vendor/upload-documents      - Upload documents
GET    /vendor/status                - Get vendor status
```

### Scheme Endpoints
```
GET    /get-schemes                  - Get all schemes
POST   /scheme/recommend/scheme      - AI scheme recommendation
```

---

## Firestore Security Rules (Recommended)

Set these rules in Firestore for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Vendors collection - authenticated users only
    match /vendors/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Schemes collection - public read, authenticated write
    match /schemes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Error Handling

If you see errors like:
```
⚠ Firebase service account JSON not found at backend/firebase-service-account.json
```

**Solution:** Download and place the Firebase service account JSON file in the backend folder.

If you see:
```
✗ Failed to initialize Firebase
```

**Solution:** 
1. Verify the JSON file is valid and has the correct permissions
2. Check your Firebase project has a Firestore database created
3. Ensure you have internet connection

---

## Data Migration Notes

### From Memory to Firestore

**Vendors**: 
- Previously: In-memory list `_vendors`
- Now: Firestore collection `vendors`
- Auto-migration: None (new vendors will be created in Firestore)

**Schemes**:
- Previously: In-memory list `_schemes`
- Now: Firestore collection `schemes`
- Auto-migration: Initial 3 schemes are automatically created on first app startup

**Documents**:
- Previously: In-memory list `_documents`
- Now: Firestore subcollection `vendors/{vendorId}/documents`

---

## Testing Firestore Integration

### Test 1: Check Schemes Loaded
```bash
curl http://localhost:5000/get-schemes
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "PM Surya Ghar Muft Bijli Yojana",
      "provider": "Government of India",
      ...
    }
  ]
}
```

### Test 2: Create New Vendor
```bash
curl -X POST http://localhost:5000/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Solar",
    "email": "test@solar.com",
    "password": "secure123",
    "phone": "9876543210",
    "location": "north",
    "price_per_kw": 45000,
    "experience_years": 5
  }'
```

Check Firestore Console → `vendors` collection to verify the document was created.

---

## Performance Tips

1. **Indexes**: Firestore will prompt you to create indexes for queries - accept them for better performance
2. **Caching**: Consider adding Redis caching layer for frequently accessed data
3. **Batch Operations**: Use bulk writes for large data imports
4. **Read/Write Limits**: Monitor usage in Firebase Console

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Service account JSON not found" | Place `firebase-service-account.json` in `backend/` folder |
| "Permission denied" errors | Check Firestore security rules and service account permissions |
| "Connection timeout" | Verify internet connection and Firebase project is active |
| "Quota exceeded" | Upgrade Firebase billing plan or reduce request frequency |

---

## Next Steps

1. ✅ Place `firebase-service-account.json` in backend folder
2. ✅ Run `pip install -r requirements.txt`
3. ✅ Start the Flask app: `python app.py`
4. ✅ Test endpoints with curl or Postman
5. ✅ Monitor Firestore Console for activity

All existing functionality is preserved. Your AI model recommendations continue to work alongside Firestore storage!
