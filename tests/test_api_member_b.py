"""
Integration tests for Member B FastAPI endpoints (tests/test_api_member_b.py).
Tests all acceptance criteria from Part 4 for Member B:
- Milestone 2: Token check, business creation, GSTIN validation
- Milestone 3: Licences scan and save with computed status
- Milestone 4: Adding or deleting a licence changes the score and breakdown list
- Milestone 5: Invoice audit; bad GSTIN produces High risk with GSTIN_INVALID
- Milestone 6: Owner flags, CA comments and resolves, owner sees the update
"""

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient

from backend.main import app
from backend.db import reset_in_memory_db, get_db

client = TestClient(app)

OWNER_AUTH_HEADER = {"Authorization": "Bearer mock-owner-token", "X-User-Id": "owner_test_1", "X-User-Role": "Owner"}
CA_AUTH_HEADER = {"Authorization": "Bearer mock-ca-token", "X-User-Id": "ca_test_1", "X-User-Role": "CA"}
STRANGER_AUTH_HEADER = {"Authorization": "Bearer mock-stranger-token", "X-User-Id": "stranger_1", "X-User-Role": "Owner"}


@pytest.fixture(autouse=True)
def setup_db():
    reset_in_memory_db()
    yield


def test_health_and_rules_endpoints():
    r1 = client.get("/")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"

    r2 = client.get("/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "ok"

    r3 = client.get("/rules")
    assert r3.status_code == 200
    rules = r3.json()
    assert isinstance(rules, list)
    assert len(rules) >= 3
    rule_codes = [r["rule_code"] for r in rules]
    assert "GSTIN_INVALID" in rule_codes
    assert "TAX_CALCULATION_MISMATCH" in rule_codes


def test_milestone_2_business_creation_and_gstin_validation():
    # 1. Validate GSTIN endpoint
    res_val = client.post("/businesses/validate-gstin", json={"gstin": "27AAACR4849R4ZI"})
    assert res_val.status_code == 200
    assert res_val.json()["valid"] is True

    # 2. Invalid GSTIN should fail business creation
    bad_biz = client.post(
        "/businesses",
        json={
            "name": "Invalid Store",
            "gstin": "27AAACR4849R4ZX",  # Bad check digit
            "type": "retail",
            "city": "Mumbai",
        },
        headers=OWNER_AUTH_HEADER,
    )
    assert bad_biz.status_code == 400
    assert "Invalid GSTIN" in bad_biz.json()["detail"]

    # 3. Valid business creation
    good_biz = client.post(
        "/businesses",
        json={
            "name": "Sharma Sweets",
            "gstin": "27AAACR4849R4ZI",
            "type": "food",
            "city": "Pune",
        },
        headers=OWNER_AUTH_HEADER,
    )
    assert good_biz.status_code == 200
    data = good_biz.json()
    assert data["name"] == "Sharma Sweets"
    assert data["ownerUid"] == "owner_test_1"
    assert "healthScore" in data
    biz_id = data["id"]

    # 4. Verify stranger cannot access Sharma Sweets (Security check)
    stranger_res = client.get(f"/businesses/{biz_id}", headers=STRANGER_AUTH_HEADER)
    assert stranger_res.status_code == 403


def test_milestone_3_licence_scan_and_status():
    # 1. Create business first
    biz = client.post(
        "/businesses",
        json={
            "name": "Haldiram Franchise",
            "gstin": "27AAACR4849R4ZI",
            "type": "food",
            "city": "Nagpur",
        },
        headers=OWNER_AUTH_HEADER,
    ).json()
    biz_id = biz["id"]

    # 2. Call /licences/scan with fallback data
    scan_res = client.post(
        "/licences/scan",
        json={
            "business_id": biz_id,
            "fallback_data": {
                "licence_type": "FSSAI",
                "licence_number": "10014011001234",
                "holder_name": "Haldiram Franchise",
                "issue_date": "2024-01-01",
                "expiry_date": (date.today() + timedelta(days=180)).isoformat(),
                "confidence": 0.98,
                "is_licence": True,
            },
        },
        headers=OWNER_AUTH_HEADER,
    )
    assert scan_res.status_code == 200
    scanned = scan_res.json()
    assert scanned["licence_type"] == "FSSAI"
    assert scanned["licence_number"] == "10014011001234"
    assert scanned["status"] == "valid"


def test_milestone_4_score_changes_on_add_and_delete_licence():
    """
    Acceptance check: Adding or deleting a licence changes the score and the breakdown list.
    """
    biz = client.post(
        "/businesses",
        json={
            "name": "Food Haven",
            "gstin": "27AAACR4849R4ZI",
            "type": "food",
            "city": "Mumbai",
        },
        headers=OWNER_AUTH_HEADER,
    ).json()
    biz_id = biz["id"]
    initial_score = biz["healthScore"]

    # Add a valid FSSAI licence
    today = date.today()
    add_res = client.post(
        "/licences",
        json={
            "business_id": biz_id,
            "type": "FSSAI",
            "number": "10014011001234",
            "expiry": (today + timedelta(days=365)).isoformat(),
            "holder_name": "Food Haven",
        },
        headers=OWNER_AUTH_HEADER,
    )
    assert add_res.status_code == 200
    licence_id = add_res.json()["id"]
    score_after_add = add_res.json()["healthScore"]

    # Score should increase after adding required licence
    assert score_after_add > initial_score

    # Check breakdown list
    score_res = client.get(f"/score/{biz_id}", headers=OWNER_AUTH_HEADER).json()
    breakdown_after_add = score_res["scoreBreakdown"]
    assert len(breakdown_after_add) > 0

    # Delete licence
    del_res = client.delete(f"/licences/{licence_id}?business_id={biz_id}", headers=OWNER_AUTH_HEADER)
    assert del_res.status_code == 200
    score_after_delete = del_res.json()["healthScore"]

    # Score drops back
    assert score_after_delete < score_after_add
    assert score_after_delete == initial_score


def test_milestone_5_invoice_audit_bad_gstin_produces_high_risk():
    """
    Acceptance check: A bad GSTIN produces a High risk chip with the correct rule_code (GSTIN_INVALID).
    """
    biz = client.post(
        "/businesses",
        json={
            "name": "Tech Supplies",
            "gstin": "27AAACR4849R4ZI",
            "type": "retail",
            "city": "Bangalore",
        },
        headers=OWNER_AUTH_HEADER,
    ).json()
    biz_id = biz["id"]

    # Audit invoice with bad GSTIN
    audit_res = client.post(
        "/invoices/audit",
        json={
            "business_id": biz_id,
            "fallback_data": {
                "invoice_number": "INV-TEST-001",
                "date": date.today().isoformat(),
                "seller_gstin": "27AAACR4849R4ZX",  # Bad check digit
                "buyer_gstin": "29AABCU9603R1ZJ",
                "taxable_value": 5000.0,
                "tax_rate": 0.18,
                "tax_amount": 900.0,
                "total": 5900.0,
                "currency": "INR",
            },
        },
        headers=OWNER_AUTH_HEADER,
    )
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert data["risk"] == "High"
    rule_codes = [issue["rule_code"] for issue in data["issues"]]
    assert "GSTIN_INVALID" in rule_codes


def test_milestone_6_flag_to_ca_workflow():
    """
    Acceptance check: Owner flags, CA comments and resolves, owner sees the update.
    """
    # 1. Create business as owner
    biz = client.post(
        "/businesses",
        json={
            "name": "Cafe Mocha",
            "gstin": "27AAACR4849R4ZI",
            "type": "food",
            "city": "Delhi",
        },
        headers=OWNER_AUTH_HEADER,
    ).json()
    biz_id = biz["id"]

    # 2. Invite CA
    invite_res = client.post(
        f"/businesses/{biz_id}/invite-ca",
        json={"ca_email": "ca@audit.com", "ca_uid": "ca_test_1"},
        headers=OWNER_AUTH_HEADER,
    )
    assert invite_res.status_code == 200
    assert "ca_test_1" in invite_res.json()["caUids"]

    # 3. Owner creates a flag
    flag_res = client.post(
        "/flags",
        json={
            "business_id": biz_id,
            "itemRef": "invoices/inv_999",
            "note": "Please check if the 12% GST rate applies here.",
        },
        headers=OWNER_AUTH_HEADER,
    )
    assert flag_res.status_code == 200
    flag_id = flag_res.json()["id"]
    assert flag_res.json()["status"] == "open"

    # 4. CA comments on the flag
    comment_res = client.post(
        f"/flags/{flag_id}/comments",
        json={
            "business_id": biz_id,
            "text": "The rate should be 5% without ITC. Asking supplier to issue credit note.",
        },
        headers=CA_AUTH_HEADER,
    )
    assert comment_res.status_code == 200
    assert comment_res.json()["authorRole"] == "CA"

    # 5. CA resolves the flag
    patch_res = client.patch(
        f"/flags/{flag_id}/status",
        json={
            "business_id": biz_id,
            "status": "resolved",
        },
        headers=CA_AUTH_HEADER,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "resolved"

    # 6. Owner views updated flag with comment thread
    get_res = client.get(f"/flags/{flag_id}?business_id={biz_id}", headers=OWNER_AUTH_HEADER)
    assert get_res.status_code == 200
    updated_flag = get_res.json()
    assert updated_flag["status"] == "resolved"
    assert len(updated_flag["comments"]) == 1
    assert "Asking supplier" in updated_flag["comments"][0]["text"]

