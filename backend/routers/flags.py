"""
Flags Router (Feature 7).
Manages Flag-to-CA workflow:
- Owner flags an invoice or licence with a note.
- Creates flag document in businesses/{id}/flags/{flagId}.
- CA adds comments in comments subcollection and updates status (needs-info, resolved).
- Health score recomputes when flag status changes.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.db import get_db
from backend.auth import AuthenticatedUser, get_current_user, verify_business_membership
from backend.services.score import recompute_and_save_score

router = APIRouter(prefix="/flags", tags=["Flags"])


class CreateFlagRequest(BaseModel):
    business_id: str
    itemRef: str = Field(..., description="Reference to item, e.g. 'invoices/inv_123' or 'licences/lic_456'")
    note: str = Field(..., description="Short explanation or question for the CA")


class AddCommentRequest(BaseModel):
    business_id: str
    text: str = Field(..., description="Comment text")


class UpdateFlagStatusRequest(BaseModel):
    business_id: str
    status: str = Field(..., description="'open', 'needs-info', or 'resolved'")


@router.post("")
def create_flag_endpoint(
    payload: CreateFlagRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    POST /flags
    Creates a new flag for a CA to review.
    """
    verify_business_membership(payload.business_id, user)
    db = get_db()

    flag_id = str(uuid.uuid4())
    doc_ref = db.collection("businesses").document(payload.business_id).collection("flags").document(flag_id)

    flag_data = {
        "id": flag_id,
        "business_id": payload.business_id,
        "itemRef": payload.itemRef,
        "note": payload.note,
        "status": "open",
        "createdBy": user.uid,
        "createdByName": user.name,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

    doc_ref.set(flag_data)
    new_score = recompute_and_save_score(payload.business_id)

    res = dict(flag_data)
    res["healthScore"] = new_score["healthScore"]
    return res


@router.get("")
def list_flags_endpoint(
    business_id: str = Query(...),
    status: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Lists flags for a business with optional status filter (open, needs-info, resolved).
    Used by the CA Workspace and Owner detail sheets.
    """
    verify_business_membership(business_id, user)
    db = get_db()

    flags_ref = db.collection("businesses").document(business_id).collection("flags")
    results = []

    for doc in flags_ref.stream():
        data = doc.to_dict() or {}
        data["id"] = doc.id
        if status and data.get("status", "").lower() != status.lower():
            continue
        results.append(data)

    return results


@router.get("/{flag_id}")
def get_flag_endpoint(
    flag_id: str,
    business_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Gets single flag details including its comment thread.
    """
    verify_business_membership(business_id, user)
    db = get_db()

    doc_ref = db.collection("businesses").document(business_id).collection("flags").document(flag_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Flag not found.")

    data = doc.to_dict() or {}
    data["id"] = flag_id

    # Fetch comments subcollection
    comments = []
    for c_doc in doc_ref.collection("comments").stream():
        c_data = c_doc.to_dict() or {}
        c_data["id"] = c_doc.id
        comments.append(c_data)

    comments.sort(key=lambda x: x.get("createdAt", ""))
    data["comments"] = comments

    return data


@router.post("/{flag_id}/comments")
def add_flag_comment_endpoint(
    flag_id: str,
    payload: AddCommentRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    POST /flags/{id}/comments
    Adds a comment to the flag thread (Owner or CA).
    """
    verify_business_membership(payload.business_id, user)
    db = get_db()

    flag_ref = db.collection("businesses").document(payload.business_id).collection("flags").document(flag_id)
    flag_doc = flag_ref.get()
    if not flag_doc.exists:
        raise HTTPException(status_code=404, detail="Flag not found.")

    comment_id = str(uuid.uuid4())
    comment_data = {
        "id": comment_id,
        "author": user.name or user.uid,
        "authorUid": user.uid,
        "authorRole": user.role,
        "text": payload.text,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    flag_ref.collection("comments").document(comment_id).set(comment_data)

    # Touch flag's updatedAt
    flag_ref.update({"updatedAt": datetime.now(timezone.utc).isoformat()})

    return comment_data


@router.patch("/{flag_id}/status")
def update_flag_status_endpoint(
    flag_id: str,
    payload: UpdateFlagStatusRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Updates flag status (e.g., CA sets 'resolved' or 'needs-info').
    Triggers score recompute.
    """
    verify_business_membership(payload.business_id, user)
    db = get_db()

    flag_ref = db.collection("businesses").document(payload.business_id).collection("flags").document(flag_id)
    flag_doc = flag_ref.get()
    if not flag_doc.exists:
        raise HTTPException(status_code=404, detail="Flag not found.")

    valid_statuses = ("open", "needs-info", "resolved")
    new_status = payload.status.lower()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    flag_ref.update({
        "status": new_status,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    })

    new_score = recompute_and_save_score(payload.business_id)

    updated = flag_ref.get().to_dict() or {}
    updated["id"] = flag_id
    updated["healthScore"] = new_score["healthScore"]
    return updated
