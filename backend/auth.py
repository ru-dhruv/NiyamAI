"""
Authentication and Authorization module for NiyamAI.
Verifies Firebase ID tokens and enforces business-level access control:
- Owners have read/write access to their business.
- CAs have read access to assigned businesses, and write access restricted to flag comments and status.
"""

import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import Header, HTTPException, Depends, status

from backend.db import get_db

try:
    import firebase_admin
    from firebase_admin import auth as fb_auth
    HAS_FIREBASE_AUTH = True
except ImportError:
    HAS_FIREBASE_AUTH = False


class AuthenticatedUser(BaseModel):
    uid: str
    email: Optional[str] = None
    role: str = "Owner"  # "Owner" or "CA"
    name: str = "User"
    language: str = "en"
    businessIds: List[str] = []


def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None),
) -> AuthenticatedUser:
    """
    Verifies Firebase ID token from Authorization header (Bearer <token>).
    Supports dev / testing fallback when Firebase credentials are not provided.
    """
    # Fast path for testing / development headers
    if x_user_id:
        return AuthenticatedUser(
            uid=x_user_id,
            email=f"{x_user_id}@niyamai.local",
            role=x_user_role or ("CA" if "ca" in x_user_id.lower() else "Owner"),
            name=f"User {x_user_id}",
        )

    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()

    if not token:
        # Check if DEV_MODE allows a default test user
        if os.getenv("DEV_MODE", "true").lower() in ("true", "1", "yes"):
            return AuthenticatedUser(
                uid="dev_owner_001",
                email="owner@niyamai.local",
                role="Owner",
                name="Demo Business Owner",
                businessIds=["biz_demo_001"],
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid format.",
        )

    # Mock tokens for tests
    if token.startswith("mock-") or token.startswith("test-"):
        is_ca = "ca" in token.lower()
        uid = f"mock_{'ca' if is_ca else 'owner'}_{token}"
        role = "CA" if is_ca else "Owner"
        return AuthenticatedUser(
            uid=uid,
            email=f"{uid}@niyamai.local",
            role=role,
            name=f"Mock {'CA' if is_ca else 'Owner'}",
        )

    # Real Firebase Auth Verification
    if HAS_FIREBASE_AUTH:
        try:
            decoded = fb_auth.verify_id_token(token)
            uid = decoded.get("uid")
            email = decoded.get("email")

            # Fetch user profile from Firestore
            db = get_db()
            user_doc = db.collection("users").document(uid).get()
            if user_doc.exists:
                user_data = user_doc.to_dict() or {}
                return AuthenticatedUser(
                    uid=uid,
                    email=email or user_data.get("email"),
                    role=user_data.get("role", "Owner"),
                    name=user_data.get("name", "User"),
                    language=user_data.get("language", "en"),
                    businessIds=user_data.get("businessIds", []),
                )
            else:
                return AuthenticatedUser(
                    uid=uid,
                    email=email,
                    role="Owner",
                    name=decoded.get("name", "New User"),
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired Firebase ID token: {str(e)}",
            )

    # Fallback when firebase auth is not configured but token was supplied
    return AuthenticatedUser(
        uid=f"usr_{token[:8]}",
        email="user@niyamai.local",
        role="Owner",
        name="Authenticated User",
    )


def verify_business_membership(
    business_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Checks that the caller belongs to the business:
    Must be the business owner (ownerUid) or an invited CA (caUids).
    Returns the business data dictionary.
    """
    db = get_db()
    biz_doc = db.collection("businesses").document(business_id).get()

    if not biz_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business '{business_id}' not found.",
        )

    biz_data = biz_doc.to_dict() or {}
    owner_uid = biz_data.get("ownerUid")
    ca_uids = biz_data.get("caUids", [])

    is_owner = user.uid == owner_uid
    is_ca = user.uid in ca_uids

    if not (is_owner or is_ca):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: caller does not belong to this business.",
        )

    biz_data["_is_owner"] = is_owner
    biz_data["_is_ca"] = is_ca
    biz_data["id"] = business_id
    return biz_data


def verify_owner_only(
    business_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Enforces that only the business owner can perform this action (e.g. deleting licences).
    """
    biz_data = verify_business_membership(business_id, user)
    if not biz_data.get("_is_owner", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the business owner can perform this operation.",
        )
    return biz_data
