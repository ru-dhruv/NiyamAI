"""
Invoices Router (Feature 5).
Audits invoices: extracts fields with Gemini AI and executes deterministic rule checks in code:
- GSTIN format and Mod-36 checksum
- Tax calculation (taxable_value * tax_rate)
- Total amount (taxable_value + tax_amount)
- Currency (INR requirement)
Computes risk level (Low, Medium, High) and assigns canonical rule_codes.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field

from backend.db import get_db
from backend.auth import AuthenticatedUser, get_current_user, verify_business_membership
from backend.services.gstin import validate_gstin
from backend.services.gemini import extract_invoice
from backend.services.score import recompute_and_save_score

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class AuditInvoiceRequest(BaseModel):
    business_id: str
    storage_path: Optional[str] = None
    file_url: Optional[str] = None
    fallback_data: Optional[Dict[str, Any]] = None


class InvoiceIssue(BaseModel):
    rule_code: str
    field: str
    message: str
    severity: str  # "High", "Medium", "Low"


class SaveInvoiceRequest(BaseModel):
    business_id: str
    extracted: Dict[str, Any]
    issues: List[Dict[str, Any]] = []
    risk: str = "Low"
    fileUrl: Optional[str] = None


class UpdateInvoiceStatusRequest(BaseModel):
    business_id: str
    status: str = Field(..., description="'active', 'fixed', or 'flagged'")
    notes: Optional[str] = None


def run_invoice_rule_checks(extracted: Dict[str, Any]) -> Tuple_Issues_Risk:
    pass


def audit_invoice_data(extracted: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes rule checks in pure Python code (never in AI):
    1. GSTIN format and checksum (Mod-36)
    2. Tax amount = taxable_value * tax_rate (tolerance ~1.5 INR)
    3. Total = taxable_value + tax_amount (tolerance ~1.5 INR)
    4. Currency == INR
    Computes risk: none = Low, one minor = Medium, any invalid GSTIN or large mismatch = High.
    """
    issues = []
    has_high_severity = False

    seller_gstin = str(extracted.get("seller_gstin") or "").strip()
    buyer_gstin = str(extracted.get("buyer_gstin") or "").strip()
    taxable_val = float(extracted.get("taxable_value") or 0.0)
    tax_rate = float(extracted.get("tax_rate") or 0.0)
    tax_amount = float(extracted.get("tax_amount") or 0.0)
    total = float(extracted.get("total") or 0.0)
    currency = str(extracted.get("currency") or "INR").strip().upper()

    # Check 1: Seller GSTIN
    if seller_gstin:
        seller_check = validate_gstin(seller_gstin)
        if not seller_check["valid"]:
            has_high_severity = True
            issues.append({
                "rule_code": "GSTIN_INVALID",
                "field": "seller_gstin",
                "message": f"Seller GSTIN '{seller_gstin}' is invalid: {seller_check['error']}",
                "severity": "High",
            })
    else:
        has_high_severity = True
        issues.append({
            "rule_code": "GSTIN_INVALID",
            "field": "seller_gstin",
            "message": "Seller GSTIN is missing from invoice.",
            "severity": "High",
        })

    # Check 1b: Buyer GSTIN (if provided)
    if buyer_gstin:
        buyer_check = validate_gstin(buyer_gstin)
        if not buyer_check["valid"]:
            has_high_severity = True
            issues.append({
                "rule_code": "GSTIN_INVALID",
                "field": "buyer_gstin",
                "message": f"Buyer GSTIN '{buyer_gstin}' is invalid: {buyer_check['error']}",
                "severity": "High",
            })

    # Check 2: Tax calculation (taxable_value * tax_rate)
    # Note: tax_rate can be 0.18 (18%) or 18.0
    effective_rate = tax_rate if tax_rate <= 1.0 else (tax_rate / 100.0)
    expected_tax = round(taxable_val * effective_rate, 2)
    tax_diff = abs(tax_amount - expected_tax)

    # Tolerance of 2.0 INR for minor rounding differences
    if tax_diff > 2.0:
        is_large = tax_diff > 50.0 or (expected_tax > 0 and (tax_diff / expected_tax) > 0.05)
        severity = "High" if is_large else "Medium"
        if severity == "High":
            has_high_severity = True
        issues.append({
            "rule_code": "TAX_CALCULATION_MISMATCH",
            "field": "tax_amount",
            "message": (
                f"Tax amount ₹{tax_amount:.2f} does not match taxable value ₹{taxable_val:.2f} "
                f"at {effective_rate * 100:.1f}% rate (expected ₹{expected_tax:.2f})."
            ),
            "severity": severity,
            "expected": expected_tax,
            "actual": tax_amount,
        })

    # Check 3: Total amount (taxable_value + tax_amount)
    expected_total = round(taxable_val + tax_amount, 2)
    total_diff = abs(total - expected_total)

    if total_diff > 2.0:
        is_large = total_diff > 50.0
        severity = "High" if is_large else "Medium"
        if severity == "High":
            has_high_severity = True
        issues.append({
            "rule_code": "TOTAL_MISMATCH",
            "field": "total",
            "message": (
                f"Invoice total ₹{total:.2f} does not equal taxable value + tax "
                f"(₹{taxable_val:.2f} + ₹{tax_amount:.2f} = ₹{expected_total:.2f})."
            ),
            "severity": severity,
            "expected": expected_total,
            "actual": total,
        })

    # Check 4: Currency check
    if currency not in ("INR", "RS", "RUPEES", "₹"):
        issues.append({
            "rule_code": "CURRENCY_NON_INR",
            "field": "currency",
            "message": f"Currency is '{currency}'. Domestic Indian GST invoices must be billed in INR.",
            "severity": "Medium",
        })

    # Risk level determination
    # none = Low, one minor = Medium, any invalid GSTIN or large mismatch = High
    if not issues:
        risk = "Low"
    elif has_high_severity or len(issues) > 1:
        risk = "High"
    else:
        risk = "Medium"

    return {
        "extracted": extracted,
        "issues": issues,
        "risk": risk,
    }


@router.post("/audit")
async def audit_invoice_endpoint(
    raw_request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    POST /invoices/audit
    Extracts invoice fields using Gemini AI, then runs rule checks in code.
    Returns: extracted fields, plain-language issues, and computed risk (Low/Medium/High).
    Supports both application/json and multipart/form-data.
    """
    content_type = raw_request.headers.get("content-type", "")
    biz_id = None
    file_bytes = None
    filename = None
    mime_type = "application/pdf"
    fallback_data = None

    if "multipart/form-data" in content_type:
        form = await raw_request.form()
        biz_id = form.get("business_id")
        uploaded_file = form.get("file")
        if uploaded_file and hasattr(uploaded_file, "read"):
            file_bytes = await uploaded_file.read()
            filename = getattr(uploaded_file, "filename", "invoice.pdf")
            mime_type = getattr(uploaded_file, "content_type", "application/pdf")
    else:
        try:
            body = await raw_request.json()
            biz_id = body.get("business_id")
            fallback_data = body.get("fallback_data")
        except Exception:
            pass

    if not biz_id:
        raise HTTPException(status_code=400, detail="business_id is required.")

    verify_business_membership(biz_id, user)

    extracted = extract_invoice(
        file_bytes=file_bytes,
        filename=filename,
        mime_type=mime_type,
        fallback_data=fallback_data,
    )

    audit_result = audit_invoice_data(extracted)
    return audit_result


@router.post("")
def save_invoice_endpoint(
    payload: SaveInvoiceRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Saves the audited invoice to businesses/{id}/invoices/{invoiceId}
    and triggers a score recompute.
    """
    verify_business_membership(payload.business_id, user)
    db = get_db()

    invoice_id = str(uuid.uuid4())
    doc_ref = db.collection("businesses").document(payload.business_id).collection("invoices").document(invoice_id)

    invoice_data = {
        "id": invoice_id,
        "extracted": payload.extracted,
        "issues": payload.issues,
        "risk": payload.risk,
        "fileUrl": payload.fileUrl,
        "status": "active",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "createdBy": user.uid,
    }

    doc_ref.set(invoice_data)

    new_score = recompute_and_save_score(payload.business_id)

    response_data = dict(invoice_data)
    response_data["healthScore"] = new_score["healthScore"]
    return response_data


@router.get("")
def list_invoices_endpoint(
    business_id: str = Query(...),
    risk: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Lists invoices for a business, optionally filtered by risk level.
    """
    verify_business_membership(business_id, user)
    db = get_db()

    invoices_ref = db.collection("businesses").document(business_id).collection("invoices")
    results = []

    for doc in invoices_ref.stream():
        data = doc.to_dict() or {}
        data["id"] = doc.id
        if risk and data.get("risk", "").lower() != risk.lower():
            continue
        results.append(data)

    return results


@router.get("/{invoice_id}")
def get_invoice_endpoint(
    invoice_id: str,
    business_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    verify_business_membership(business_id, user)
    db = get_db()

    doc = db.collection("businesses").document(business_id).collection("invoices").document(invoice_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    data = doc.to_dict() or {}
    data["id"] = invoice_id
    return data


@router.patch("/{invoice_id}/status")
def update_invoice_status_endpoint(
    invoice_id: str,
    payload: UpdateInvoiceStatusRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Updates invoice status (e.g. marked as 'fixed', lowering risk to 'Low')
    and recomputes score.
    """
    verify_business_membership(payload.business_id, user)
    db = get_db()

    doc_ref = db.collection("businesses").document(payload.business_id).collection("invoices").document(invoice_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    update_dict = {
        "status": payload.status,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    if payload.status == "fixed":
        update_dict["risk"] = "Low"
    if payload.notes:
        update_dict["resolution_notes"] = payload.notes

    doc_ref.update(update_dict)
    new_score = recompute_and_save_score(payload.business_id)

    updated_data = doc_ref.get().to_dict() or {}
    updated_data["id"] = invoice_id
    updated_data["healthScore"] = new_score["healthScore"]
    return updated_data
