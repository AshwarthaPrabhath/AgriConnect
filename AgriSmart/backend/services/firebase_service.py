"""
Firebase Service — Firestore read/write helper
"""
import os
import json

try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    _cred_path = os.environ.get("FIREBASE_CREDENTIALS", "firebase_credentials.json")
    if os.path.exists(_cred_path) and not firebase_admin._apps:
        cred = credentials.Certificate(_cred_path)
        firebase_admin.initialize_app(cred)
        _db = firestore.client()
        FIREBASE_ENABLED = True
    else:
        FIREBASE_ENABLED = False
        _db = None
except Exception:
    FIREBASE_ENABLED = False
    _db = None


def save_recommendation(session_id: str, payload: dict):
    if not FIREBASE_ENABLED:
        return {"status": "skipped", "reason": "Firebase not configured"}
    try:
        doc_ref = _db.collection("recommendations").document(session_id)
        doc_ref.set(payload)
        return {"status": "saved", "id": session_id}
    except Exception as e:
        return {"status": "error", "reason": str(e)}


def get_history(session_id: str):
    if not FIREBASE_ENABLED:
        return []
    try:
        docs = _db.collection("recommendations") \
                   .where("session_id", "==", session_id) \
                   .order_by("timestamp", direction=firestore.Query.DESCENDING) \
                   .limit(10).stream()
        return [d.to_dict() for d in docs]
    except Exception:
        return []
