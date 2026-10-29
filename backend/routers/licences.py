"""
Licences Router (Feature 4).
Handles licence scanning with Gemini AI, validation, storage, and status computation.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field

from backend.db import get_db
from backend.auth import AuthenticatedUser, get_current_user, verify_business_membership, verify_owner_only
from backend.services.gemini import scan_licence, compute_licence_status
from backend.services.score import recompute_and_save_score

router = APIRouter(prefix="/licences", tags=["Licences"])


class LicenceScanRequest(BaseModel):
    business_id: str
    storage_path: Optional[str] = None
    file_url: Optional[str] = None
    fallback_data: Optional[Dict[str, Any]] = None


class LicenceSaveRequest(BaseModel):
    business_id: str
    type: str = Field(..., description="Licence type (e.g. FSSAI, Trade Licence, GST)")
    number: str = Field(..., description="Licence / registration number")
    expiry: Optional[str] = Field(None, description="Expiry date in YYYY-MM-DD")
    fileUrl: Optional[str] = None
    confidence: Optional[float] = 0.95
    holder_name: Optional[str] = None
    issue_date: Optional[str] = None


class LicenceUpdateRequest(BaseModel):
    business_id: str
    type: Optional[str] = None
    number: Optional[str] = None
    expiry: Optional[str] = None
    fileUrl: Optional[str] = None
    holder_name: Optional[str] = None
    issue_date: Optional[str] = None


@router.post("/scan")
async def scan_licence_endpoint(
    raw_request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    POST /licences/scan
    Reads a licence photo/PDF or JSON payload, sends to Gemini AI with fixed prompt,
    validates the structured JSON (dates parse, number pattern, confidence),
    and returns editable fields with computed status.
    Supports both application/json and multipart/form-data.
    """
    content_type = raw_request.headers.get("content-type", "")
    biz_id = None
    file_bytes = None
    filename = None
    mime_type = "image/jpeg"
    fallback_data = None

    if "multipart/form-data" in content_type:
        form = await raw_request.form()
        biz_id = form.get("business_id")
        uploaded_file = form.get("file")
        if uploaded_file and hasattr(uploaded_file, "read"):
            file_bytes = await uploaded_file.read()
            filename = getattr(uploaded_file, "filename", "licence.jpg")
            mime_type = getattr(uploaded_file, "content_type", "image/jpeg")
    else:
        try:
            body = await raw_request.json()
            biz_id = body.get("business_id")
            fallback_data = body.get("fallback_data")
        except Exception:
            pass

    if not biz_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="business_id is required.",
        )

    verify_business_membership(biz_id, user)

    result = scan_licence(
        file_bytes=file_bytes,
        filename=filename,
        mime_type=mime_type,
        fallback_data=fallback_data,
    )

    return result


@router.post("")
def save_licence_endpoint(
    payload: LicenceSaveRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Saves a confirmed licence to businesses/{id}/licences/{licenceId}
    and triggers a score recompute.
    """
    verify_business_membership(payload.business_id, user)
    db = get_db()

    licence_id = str(uuid.uuid4())
    doc_ref = db.collection("businesses").document(payload.business_id).collection("licences").document(licence_id)

    licence_data = {
        "id": licence_id,
        "type": payload.type.strip(),
        "number": payload.number.strip(),
        "expiry": payload.expiry,
        "fileUrl": payload.fileUrl,
        "confidence": payload.confidence,
        "holder_name": payload.holder_name,
        "issue_date": payload.issue_date,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "createdBy": user.uid,
    }

    doc_ref.set(licence_data)

    # Trigger score recompute
    new_score = recompute_and_save_score(payload.business_id)

    # Response with computed status
    computed_status = compute_licence_status(payload.expiry)
    response_data = dict(licence_data)
    response_data["status"] = computed_status
    response_data["healthScore"] = new_score["healthScore"]

    return response_data


@router.get("")
def list_licences_endpoint(
    business_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Lists licences for a business. Status is dynamically computed, never stored manually.
    """
    verify_business_membership(business_id, user)
    db = get_db()

    licences_ref = db.collection("businesses").document(business_id).collection("licences")
    results = []

    for doc in licences_ref.stream():
        data = doc.to_dict() or {}
        data["id"] = doc.id
        data["status"] = compute_licence_status(data.get("expiry"))
        results.append(data)

    return results


@router.get("/{licence_id}")
def get_licence_endpoint(
    licence_id: str,
    business_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    verify_business_membership(business_id, user)
    db = get_db()

    doc = db.collection("businesses").document(business_id).collection("licences").document(licence_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Licence not found.")

    data = doc.to_dict() or {}
    data["id"] = licence_id
    data["status"] = compute_licence_status(data.get("expiry"))
    return data


@router.put("/{licence_id}")
def update_licence_endpoint(
    licence_id: str,
    payload: LicenceUpdateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    verify_business_membership(payload.business_id, user)
    db = get_db()

    doc_ref = db.collection("businesses").document(payload.business_id).collection("licences").document(licence_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Licence not found.")

    update_dict = {}
    if payload.type is not None:
        update_dict["type"] = payload.type
    if payload.number is not None:
        update_dict["number"] = payload.number
    if payload.expiry is not None:
        update_dict["expiry"] = payload.expiry
    if payload.fileUrl is not None:
        update_dict["fileUrl"] = payload.fileUrl
    if payload.holder_name is not None:
        update_dict["holder_name"] = payload.holder_name
    if payload.issue_date is not None:
        update_dict["issue_date"] = payload.issue_date

    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    doc_ref.update(update_dict)

    recompute_and_save_score(payload.business_id)

    updated_data = doc_ref.get().to_dict() or {}
    updated_data["id"] = licence_id
    updated_data["status"] = compute_licence_status(updated_data.get("expiry"))
    return updated_data


@router.delete("/{licence_id}")
def delete_licence_endpoint(
    licence_id: str,
    business_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Deletes licence and triggers score recompute.
    """
    verify_owner_only(business_id, user)
    db = get_db()

    doc_ref = db.collection("businesses").document(business_id).collection("licences").document(licence_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Licence not found.")

    doc_ref.delete()
    new_score = recompute_and_save_score(business_id)

    return {
        "success": True,
        "message": "Licence deleted successfully.",
        "healthScore": new_score["healthScore"],
    }
