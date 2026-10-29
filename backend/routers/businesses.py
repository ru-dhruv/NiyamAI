"""
Businesses Router (Milestone 2 - Auth and Onboarding).
Handles business creation, GSTIN validation, and CA invitation.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.db import get_db
from backend.auth import AuthenticatedUser, get_current_user, verify_business_membership, verify_owner_only
from backend.services.gstin import validate_gstin
from backend.services.score import recompute_and_save_score

router = APIRouter(prefix="/businesses", tags=["Businesses"])


class CreateBusinessRequest(BaseModel):
    name: str = Field(..., description="Business name")
    gstin: str = Field(..., description="15-character GSTIN")
    type: str = Field(..., description="Business type: food, retail, manufacturing, services, etc.")
    city: str = Field(..., description="City")
    state: Optional[str] = Field(None, description="State")


class InviteCARequest(BaseModel):
    ca_email: str
    ca_uid: Optional[str] = None


class ValidateGSTINRequest(BaseModel):
    gstin: str


@router.post("/validate-gstin")
def validate_gstin_endpoint(payload: ValidateGSTINRequest):
    """
    Validates GSTIN as typed (format and Mod-36 checksum).
    Used by the Onboarding step in the frontend.
    """
    return validate_gstin(payload.gstin)


@router.post("")
def create_business_endpoint(
    payload: CreateBusinessRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Milestone 2: Creates a new business during onboarding.
    Validates GSTIN, initializes business in Firestore, and updates user's businessIds.
    """
    # Validate GSTIN
    gstin_res = validate_gstin(payload.gstin)
    if not gstin_res["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GSTIN: {gstin_res.get('error')}",
        )

    db = get_db()
    biz_id = str(uuid.uuid4())
    state_resolved = payload.state or gstin_res.get("state_name", "Unknown")

    biz_data = {
        "id": biz_id,
        "name": payload.name.strip(),
        "gstin": payload.gstin.strip().upper(),
        "type": payload.type.strip().lower(),
        "city": payload.city.strip(),
        "state": state_resolved,
        "ownerUid": user.uid,
        "caUids": [],
        "healthScore": 0,
        "scoreBreakdown": [],
        "penaltyExposure": 0.0,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    # Save business document
    db.collection("businesses").document(biz_id).set(biz_data)

    # Link business to user document
    user_ref = db.collection("users").document(user.uid)
    user_snap = user_ref.get()
    if user_snap.exists:
        u_data = user_snap.to_dict() or {}
        b_ids = u_data.get("businessIds", [])
        if biz_id not in b_ids:
            b_ids.append(biz_id)
            user_ref.update({"businessIds": b_ids})
    else:
        user_ref.set({
            "uid": user.uid,
            "role": user.role,
            "name": user.name,
            "email": user.email,
            "businessIds": [biz_id],
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })

    # Compute initial score
    score_res = recompute_and_save_score(biz_id)
    biz_data["healthScore"] = score_res["healthScore"]
    biz_data["scoreBreakdown"] = score_res["scoreBreakdown"]
    biz_data["penaltyExposure"] = score_res["penaltyExposure"]

    return biz_data


@router.get("/{business_id}")
def get_business_endpoint(
    business_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    biz_data = verify_business_membership(business_id, user)
    return biz_data


@router.post("/{business_id}/invite-ca")
def invite_ca_endpoint(
    business_id: str,
    payload: InviteCARequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Owner invites a CA by email/uid. The CA gains read access to this one business.
    """
    verify_owner_only(business_id, user)
    db = get_db()
    biz_ref = db.collection("businesses").document(business_id)

    biz_snap = biz_ref.get()
    biz_data = biz_snap.to_dict() or {}
    ca_uids = biz_data.get("caUids", [])

    target_uid = payload.ca_uid or f"ca_{payload.ca_email}"
    if target_uid not in ca_uids:
        ca_uids.append(target_uid)
        biz_ref.update({"caUids": ca_uids})

    return {
        "success": True,
        "message": f"CA {payload.ca_email} invited successfully.",
        "caUids": ca_uids,
    }
