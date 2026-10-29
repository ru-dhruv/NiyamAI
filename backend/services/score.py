"""
Compliance Health Score Engine (Feature 3).
Computes the 0-100 Compliance Health Score and penalty exposure:
- Licences: 40 points
- Invoices: 30 points
- Open CA flags: 15 points
- Deadlines: 15 points
"""

import os
import json
from datetime import datetime, date, timedelta, timezone
from typing import Dict, Any, List, Optional

from backend.db import get_db
from backend.services.gemini import compute_licence_status

DEFAULT_REQUIRED_LICENCES = {
    "food": ["FSSAI", "Trade Licence", "Fire NOC", "GST"],
    "retail": ["Trade Licence", "Shop and Establishment", "GST"],
    "manufacturing": ["Factory Licence", "Pollution Control Board NOC", "Fire NOC", "GST"],
    "services": ["Trade Licence", "GST", "Professional Tax"],
    "default": ["Trade Licence", "GST"],
}

# Estimated baseline penalties for open lapses (in INR)
ESTIMATED_PENALTIES = {
    "FSSAI_EXPIRED": 5000.0,
    "FSSAI_MISSING": 10000.0,
    "TRADE_LIC_EXPIRED": 2500.0,
    "TRADE_LIC_MISSING": 5000.0,
    "GST_EXPIRED": 10000.0,
    "GST_MISSING": 25000.0,
    "GSTIN_INVALID": 10000.0,
    "INVOICE_TAX_MISMATCH": 5000.0,
    "OVERDUE_DEADLINE": 2000.0,
    "DEFAULT_LAPSE": 2000.0,
}


def load_required_licences_config() -> Dict[str, List[str]]:
    """Loads required licences config from data file if present, else defaults."""
    config_path = os.path.join(os.path.dirname(__file__), "..", "data", "required_licences.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_REQUIRED_LICENCES


def get_required_licences_for_type(business_type: str) -> List[str]:
    cfg = load_required_licences_config()
    btype = (business_type or "default").lower().strip()
    return cfg.get(btype, cfg.get("default", ["Trade Licence", "GST"]))


def calculate_licences_score(required: List[str], licences: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Licences: 40 points.
    Each required licence is scored:
    - valid: 1.0 (full)
    - expiring within 30 days: 0.5 (half)
    - expired or missing: 0.0 (zero)
    Then averaged across required licences.
    """
    if not required:
        return {
            "score": 40,
            "max": 40,
            "lost": 0,
            "details": [],
            "penalty": 0.0,
        }

    # Map existing licences by normalized type
    licence_map: Dict[str, Dict[str, Any]] = {}
    for lic in licences:
        ltype = lic.get("type", "").strip().lower()
        licence_map[ltype] = lic

    total_weight = 0.0
    details = []
    penalty_exposure = 0.0

    for req in required:
        req_norm = req.strip().lower()
        matched = None
        for key, lic in licence_map.items():
            if req_norm in key or key in req_norm:
                matched = lic
                break

        if not matched:
            total_weight += 0.0
            details.append(f"{req}: Missing (Not added yet)")
            penalty_exposure += ESTIMATED_PENALTIES.get(f"{req.upper()}_MISSING", 5000.0)
        else:
            status = compute_licence_status(matched.get("expiry"))
            if status == "valid":
                total_weight += 1.0
                details.append(f"{req}: Valid")
            elif status == "expiring":
                total_weight += 0.5
                details.append(f"{req}: Expiring soon (within 30 days)")
            else:
                total_weight += 0.0
                details.append(f"{req}: Expired")
                penalty_exposure += ESTIMATED_PENALTIES.get(f"{req.upper()}_EXPIRED", 5000.0)

    avg_ratio = total_weight / len(required)
    score = round(40 * avg_ratio)
    lost = 40 - score

    return {
        "score": score,
        "max": 40,
        "lost": lost,
        "details": details,
        "penalty": penalty_exposure,
    }


def calculate_invoices_score(invoices: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Invoices: 30 points, based on the share of the last 30 days' invoices with low risk.
    """
    today = date.today()
    cutoff_date = today - timedelta(days=30)

    recent_invoices = []
    for inv in invoices:
        extracted = inv.get("extracted", {})
        date_str = extracted.get("date") or inv.get("createdAt", "")[:10]
        try:
            inv_date = datetime.strptime(date_str[:10], "%Y-%m-%d").date()
            if inv_date >= cutoff_date:
                recent_invoices.append(inv)
        except Exception:
            recent_invoices.append(inv)

    if not recent_invoices:
        # Default to full points if no invoices in last 30 days
        return {
            "score": 30,
            "max": 30,
            "lost": 0,
            "details": ["No invoices in the last 30 days"],
            "penalty": 0.0,
        }

    low_risk_count = 0
    penalty_exposure = 0.0
    high_risk_issues = []

    for inv in recent_invoices:
        risk = inv.get("risk", "Low")
        if risk == "Low":
            low_risk_count += 1
        elif risk == "High":
            penalty_exposure += ESTIMATED_PENALTIES.get("GSTIN_INVALID", 10000.0)
            high_risk_issues.append(f"Invoice {inv.get('extracted', {}).get('invoice_number', 'Unknown')} has High risk issues")
        else:
            penalty_exposure += ESTIMATED_PENALTIES.get("INVOICE_TAX_MISMATCH", 5000.0)

    share_low_risk = low_risk_count / len(recent_invoices)
    score = round(30 * share_low_risk)
    lost = 30 - score

    return {
        "score": score,
        "max": 30,
        "lost": lost,
        "details": high_risk_issues or [f"{low_risk_count}/{len(recent_invoices)} invoices have low risk"],
        "penalty": penalty_exposure,
    }


def calculate_flags_score(flags: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Open CA flags: 15 points, reduced for each unresolved flag older than 7 days.
    """
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    overdue_flags = []
    for flag in flags:
        status = flag.get("status", "open")
        if status in ("open", "needs-info"):
            created_str = flag.get("createdAt", "")
            try:
                created_dt = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                if created_dt.tzinfo is None:
                    created_dt = created_dt.replace(tzinfo=timezone.utc)
                if created_dt < seven_days_ago:
                    overdue_flags.append(flag)
            except Exception:
                pass

    deduction_per_flag = 5
    lost = min(15, len(overdue_flags) * deduction_per_flag)
    score = 15 - lost

    details = []
    if overdue_flags:
        details.append(f"{len(overdue_flags)} unresolved CA flag(s) older than 7 days")
    else:
        details.append("No overdue CA flags")

    return {
        "score": score,
        "max": 15,
        "lost": lost,
        "details": details,
        "penalty": 0.0,
    }


def calculate_deadlines_score(deadlines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Deadlines: 15 points, reduced for each overdue item in the calendar.
    """
    today = date.today()
    overdue_items = []
    penalty_exposure = 0.0

    for item in deadlines:
        due_str = item.get("dueDate") or item.get("date")
        if due_str:
            try:
                due_date = datetime.strptime(str(due_str)[:10], "%Y-%m-%d").date()
                if due_date < today and not item.get("completed", False):
                    overdue_items.append(item)
                    penalty_exposure += ESTIMATED_PENALTIES.get("OVERDUE_DEADLINE", 2000.0)
            except Exception:
                pass

    deduction_per_overdue = 5
    lost = min(15, len(overdue_items) * deduction_per_overdue)
    score = 15 - lost

    details = []
    if overdue_items:
        details.append(f"{len(overdue_items)} overdue compliance deadline(s)")
    else:
        details.append("All scheduled deadlines are on track")

    return {
        "score": score,
        "max": 15,
        "lost": lost,
        "details": details,
        "penalty": penalty_exposure,
    }


def compute_health_score(
    business: Dict[str, Any],
    licences: List[Dict[str, Any]],
    invoices: List[Dict[str, Any]],
    flags: List[Dict[str, Any]],
    deadlines: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Computes total compliance health score (0-100), breakdown list sorted by points lost,
    and estimated penalty exposure.
    """
    business_type = business.get("type", "retail")
    required = get_required_licences_for_type(business_type)

    lic_res = calculate_licences_score(required, licences)
    inv_res = calculate_invoices_score(invoices)
    flag_res = calculate_flags_score(flags)
    dl_res = calculate_deadlines_score(deadlines or [])

    total_score = max(0, min(100, lic_res["score"] + inv_res["score"] + flag_res["score"] + dl_res["score"]))
    total_penalty = lic_res["penalty"] + inv_res["penalty"] + flag_res["penalty"] + dl_res["penalty"]

    breakdown = [
        {
            "category": "Licences",
            "score": lic_res["score"],
            "max": lic_res["max"],
            "lost": lic_res["lost"],
            "reasons": lic_res["details"],
        },
        {
            "category": "Invoices",
            "score": inv_res["score"],
            "max": inv_res["max"],
            "lost": inv_res["lost"],
            "reasons": inv_res["details"],
        },
        {
            "category": "CA Flags",
            "score": flag_res["score"],
            "max": flag_res["max"],
            "lost": flag_res["lost"],
            "reasons": flag_res["details"],
        },
        {
            "category": "Deadlines",
            "score": dl_res["score"],
            "max": dl_res["max"],
            "lost": dl_res["lost"],
            "reasons": dl_res["details"],
        },
    ]

    # "What is lowering your score" list: sorted descending by points lost
    breakdown_sorted = sorted(breakdown, key=lambda x: x["lost"], reverse=True)

    return {
        "healthScore": total_score,
        "scoreBreakdown": breakdown_sorted,
        "penaltyExposure": total_penalty,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }


def recompute_and_save_score(business_id: str) -> Dict[str, Any]:
    """
    Fetches all subcollections for a business, recomputes the score,
    and updates the business document.
    """
    db = get_db()
    biz_doc_ref = db.collection("businesses").document(business_id)
    biz_snap = biz_doc_ref.get()

    if not biz_snap.exists:
        raise ValueError(f"Business '{business_id}' does not exist.")

    biz_data = biz_snap.to_dict() or {}

    # Gather licences
    licences = [s.to_dict() for s in biz_doc_ref.collection("licences").stream() if s.to_dict()]

    # Gather invoices
    invoices = [s.to_dict() for s in biz_doc_ref.collection("invoices").stream() if s.to_dict()]

    # Gather flags
    flags = [s.to_dict() for s in biz_doc_ref.collection("flags").stream() if s.to_dict()]

    # Gather deadlines / reminders
    deadlines = [s.to_dict() for s in biz_doc_ref.collection("reminders").stream() if s.to_dict()]

    computed = compute_health_score(biz_data, licences, invoices, flags, deadlines)

    biz_doc_ref.update({
        "healthScore": computed["healthScore"],
        "scoreBreakdown": computed["scoreBreakdown"],
        "penaltyExposure": computed["penaltyExposure"],
        "scoreUpdatedAt": computed["updatedAt"],
    })

    return computed
