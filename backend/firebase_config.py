"""
Firebase Firestore Configuration
Initializes Firebase Admin SDK and provides Firestore client
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

# Get the path to the service account JSON file
FIREBASE_CREDENTIALS_PATH = os.path.join(
    os.path.dirname(__file__), "firebase-service-account.json"
)

db = None

def initialize_firebase():
    """
    Initialize Firebase Admin SDK using service account credentials.
    
    Returns:
        firestore.Client: Firestore database client
    
    Raises:
        FileNotFoundError: If firebase-service-account.json is not found
        Exception: If Firebase initialization fails
    """
    global db
    
    if db is not None:
        return db
    
    try:
        if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
            raise FileNotFoundError(
                f"Firebase service account JSON not found at {FIREBASE_CREDENTIALS_PATH}. "
                "Please download it from Firebase Console and place it in the backend folder."
            )
        
        # Initialize Firebase with credentials
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        
        # Get Firestore client
        db = firestore.client()
        print("✓ Firebase Firestore initialized successfully")
        return db
        
    except FileNotFoundError as e:
        print(f"⚠ {str(e)}")
        raise
    except Exception as e:
        print(f"✗ Failed to initialize Firebase: {str(e)}")
        raise

def get_db():
    """
    Get the Firestore database client.
    Initializes if not already done.
    
    Returns:
        firestore.Client: Firestore database client
    """
    global db
    if db is None:
        db = initialize_firebase()
    return db
