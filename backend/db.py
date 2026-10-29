"""
Firestore database abstraction layer with in-memory fallback for local development and testing.
Provides consistent access to Firestore collections and documents conforming to Section 1.4.
"""

import os
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False


class InMemoryDocumentRef:
    def __init__(self, doc_id: str, collection_ref: "InMemoryCollectionRef"):
        self.id = doc_id
        self._collection = collection_ref
        self._subcollections: Dict[str, "InMemoryCollectionRef"] = {}

    def get(self):
        data = self._collection._store.get(self.id)
        return InMemoryDocumentSnapshot(self.id, data, exists=data is not None)

    def set(self, data: Dict[str, Any], merge: bool = False):
        if merge and self.id in self._collection._store:
            self._collection._store[self.id].update(data)
        else:
            self._collection._store[self.id] = dict(data)
        return self

    def update(self, data: Dict[str, Any]):
        if self.id not in self._collection._store:
            self._collection._store[self.id] = {}
        self._collection._store[self.id].update(data)
        return self

    def delete(self):
        if self.id in self._collection._store:
            del self._collection._store[self.id]
        if self.id in self._collection._doc_refs:
            del self._collection._doc_refs[self.id]

    def collection(self, name: str) -> "InMemoryCollectionRef":
        if name not in self._subcollections:
            self._subcollections[name] = InMemoryCollectionRef(name, parent_doc=self)
        return self._subcollections[name]


class InMemoryDocumentSnapshot:
    def __init__(self, doc_id: str, data: Optional[Dict[str, Any]], exists: bool):
        self.id = doc_id
        self._data = data
        self.exists = exists

    def to_dict(self) -> Optional[Dict[str, Any]]:
        return dict(self._data) if self._data is not None else None


class InMemoryCollectionRef:
    def __init__(self, name: str, parent_doc: Optional[InMemoryDocumentRef] = None):
        self.name = name
        self.parent_doc = parent_doc
        self._store: Dict[str, Dict[str, Any]] = {}
        self._doc_refs: Dict[str, InMemoryDocumentRef] = {}

    def document(self, doc_id: Optional[str] = None) -> InMemoryDocumentRef:
        if not doc_id:
            doc_id = str(uuid.uuid4())
        if doc_id not in self._doc_refs:
            self._doc_refs[doc_id] = InMemoryDocumentRef(doc_id, self)
        return self._doc_refs[doc_id]

    def stream(self):
        for doc_id, data in list(self._store.items()):
            yield InMemoryDocumentSnapshot(doc_id, data, exists=True)


class InMemoryFirestoreClient:
    def __init__(self):
        self._collections: Dict[str, InMemoryCollectionRef] = {}

    def collection(self, name: str) -> InMemoryCollectionRef:
        if name not in self._collections:
            self._collections[name] = InMemoryCollectionRef(name)
        return self._collections[name]

    def reset(self):
        self._collections.clear()


# Global DB client singleton
_db_client = None
_in_memory_instance: Optional[InMemoryFirestoreClient] = None


def get_db():
    global _db_client, _in_memory_instance

    if _db_client is not None:
        return _db_client

    use_in_memory = os.getenv("USE_IN_MEMORY_DB", "true").lower() in ("true", "1", "yes")
    firebase_cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")

    if not use_in_memory and HAS_FIREBASE:
        try:
            if not firebase_admin._apps:
                if firebase_cred_path and os.path.exists(firebase_cred_path):
                    cred = credentials.Certificate(firebase_cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()
            _db_client = firestore.client()
            return _db_client
        except Exception:
            pass

    if _in_memory_instance is None:
        _in_memory_instance = InMemoryFirestoreClient()
    _db_client = _in_memory_instance
    return _db_client


def reset_in_memory_db():
    global _in_memory_instance
    if _in_memory_instance is not None:
        _in_memory_instance.reset()
