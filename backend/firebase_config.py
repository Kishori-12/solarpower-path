"""
Firebase Firestore Configuration
Uses Admin SDK if service account JSON is present,
otherwise falls back to REST API using web API key.
"""
import os
import requests
import firebase_admin
from firebase_admin import credentials, firestore

PROJECT_ID = "solarwise-30e48"
API_KEY    = "AIzaSyAwAS3emloLHnqWtVWzDOBSo6dZVXqOFgk"
REST_BASE  = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), "firebase-service-account.json")

db = None
_use_rest = False   # True when falling back to REST API


# ── Admin SDK init ────────────────────────────────────────
def initialize_firebase():
    global db, _use_rest
    if db is not None:
        return db

    if os.path.exists(SERVICE_ACCOUNT_PATH):
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
                firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("[OK] Firebase Admin SDK initialized with service account")
            return db
        except Exception as e:
            print(f"[WARNING] Admin SDK failed: {e}")

    # Fallback: use REST API
    print(f"[INFO] No service account found. Using Firestore REST API for project: {PROJECT_ID}")
    _use_rest = True
    db = _RestFirestoreClient()
    return db


def get_db():
    global db
    if db is None:
        db = initialize_firebase()
    return db


# ── REST API client (mimics Firestore Admin SDK interface) ─
class _RestFirestoreClient:
    """Minimal Firestore client using REST API — no service account needed."""

    def collection(self, name: str):
        return _RestCollection(name)


class _RestCollection:
    def __init__(self, name: str):
        self.name = name

    def stream(self):
        url = f"{REST_BASE}/{self.name}?key={API_KEY}"
        try:
            res = requests.get(url, timeout=10)
            if res.status_code != 200:
                print(f"[WARNING] Firestore REST GET {self.name}: {res.status_code}")
                return []
            data = res.json()
            docs = data.get("documents", [])
            return [_RestDocument(d) for d in docs]
        except Exception as e:
            print(f"[WARNING] Firestore REST error: {e}")
            return []

    def where(self, field: str, op: str, value):
        return _RestQuery(self.name, field, op, value)

    def document(self, doc_id: str = None):
        return _RestDocRef(self.name, doc_id)

    def limit(self, n: int):
        return _RestQuery(self.name, limit=n)

    def add(self, data: dict):
        import uuid
        doc_id = str(uuid.uuid4())
        ref = _RestDocRef(self.name, doc_id)
        ref.set(data)
        return None, ref


class _RestQuery:
    def __init__(self, collection: str, field: str = None, op: str = None, value=None, limit: int = None):
        self.collection = collection
        self.field = field
        self.op = op
        self.value = value
        self._limit = limit

    def stream(self):
        all_docs = _RestCollection(self.collection).stream()
        if self.field and self.op and self.value is not None:
            filtered = []
            for doc in all_docs:
                d = doc.to_dict()
                v = d.get(self.field)
                if self.op == "==" and v == self.value:
                    filtered.append(doc)
            return filtered[:self._limit] if self._limit else filtered
        return all_docs[:self._limit] if self._limit else all_docs

    def limit(self, n: int):
        self._limit = n
        return self

    def where(self, field: str, op: str, value):
        return _RestQuery(self.collection, field, op, value, self._limit)


class _RestDocRef:
    def __init__(self, collection: str, doc_id: str):
        self.collection = collection
        self.doc_id = doc_id

    @property
    def id(self):
        return self.doc_id

    def get(self):
        url = f"{REST_BASE}/{self.collection}/{self.doc_id}?key={API_KEY}"
        try:
            res = requests.get(url, timeout=10)
            if res.status_code == 200:
                return _RestDocument(res.json())
            return _RestDocument(None)
        except Exception:
            return _RestDocument(None)

    def set(self, data: dict):
        url = f"{REST_BASE}/{self.collection}/{self.doc_id}?key={API_KEY}"
        payload = {"fields": _to_firestore_fields(data)}
        requests.patch(url, json=payload, timeout=10)

    def update(self, data: dict):
        self.set(data)

    def delete(self):
        url = f"{REST_BASE}/{self.collection}/{self.doc_id}?key={API_KEY}"
        requests.delete(url, timeout=10)

    def collection(self, sub: str):
        return _RestCollection(f"{self.collection}/{self.doc_id}/{sub}")


class _RestDocument:
    def __init__(self, raw: dict):
        self._raw = raw

    @property
    def exists(self):
        return self._raw is not None and "fields" in self._raw

    @property
    def id(self):
        if self._raw and "name" in self._raw:
            return self._raw["name"].split("/")[-1]
        return None

    def to_dict(self):
        if not self.exists:
            return {}
        return _from_firestore_fields(self._raw.get("fields", {}))


# ── Firestore field converters ────────────────────────────
def _to_firestore_fields(data: dict) -> dict:
    fields = {}
    for k, v in data.items():
        if isinstance(v, bool):
            fields[k] = {"booleanValue": v}
        elif isinstance(v, int):
            fields[k] = {"integerValue": str(v)}
        elif isinstance(v, float):
            fields[k] = {"doubleValue": v}
        elif isinstance(v, list):
            fields[k] = {"arrayValue": {"values": [{"stringValue": str(i)} for i in v]}}
        elif isinstance(v, str):
            fields[k] = {"stringValue": v}
        elif v is None:
            fields[k] = {"nullValue": None}
    return fields


def _from_firestore_fields(fields: dict) -> dict:
    result = {}
    for k, v in fields.items():
        if "stringValue"  in v: result[k] = v["stringValue"]
        elif "integerValue" in v: result[k] = int(v["integerValue"])
        elif "doubleValue"  in v: result[k] = float(v["doubleValue"])
        elif "booleanValue" in v: result[k] = v["booleanValue"]
        elif "nullValue"    in v: result[k] = None
        elif "arrayValue"   in v:
            vals = v["arrayValue"].get("values", [])
            result[k] = [list(_from_firestore_fields({"x": i}).values())[0] for i in vals]
        elif "mapValue"     in v:
            result[k] = _from_firestore_fields(v["mapValue"].get("fields", {}))
    return result
