"""
Unit tests for invoice auditing and rule checks (routers/invoices.py).
"""

from backend.routers.invoices import audit_invoice_data


def test_audit_invoice_valid_clean():
    clean_inv = {
        "invoice_number": "INV-101",
        "date": "2026-10-20",
        "seller_gstin": "27AAACR4849R4ZI",
        "buyer_gstin": "29AABCU9603R1ZJ",
        "taxable_value": 1000.0,
        "tax_rate": 0.18,
        "tax_amount": 180.0,
        "total": 1180.0,
        "currency": "INR",
    }
    res = audit_invoice_data(clean_inv)
    assert res["risk"] == "Low"
    assert len(res["issues"]) == 0


def test_audit_invoice_invalid_seller_gstin_high_risk():
    # Acceptance check: A bad GSTIN produces a High risk chip with the correct rule_code
    inv = {
        "invoice_number": "INV-102",
        "date": "2026-10-20",
        "seller_gstin": "27AAACR4849R4ZX",  # Bad check digit
        "buyer_gstin": "29AABCU9603R1ZJ",
        "taxable_value": 1000.0,
        "tax_rate": 0.18,
        "tax_amount": 180.0,
        "total": 1180.0,
        "currency": "INR",
    }
    res = audit_invoice_data(inv)
    assert res["risk"] == "High"
    gstin_issues = [i for i in res["issues"] if i["rule_code"] == "GSTIN_INVALID"]
    assert len(gstin_issues) == 1
    assert gstin_issues[0]["field"] == "seller_gstin"
    assert gstin_issues[0]["severity"] == "High"


def test_audit_invoice_tax_mismatch():
    inv = {
        "invoice_number": "INV-103",
        "date": "2026-10-20",
        "seller_gstin": "27AAACR4849R4ZI",
        "buyer_gstin": "29AABCU9603R1ZJ",
        "taxable_value": 10000.0,
        "tax_rate": 0.18,
        "tax_amount": 1200.0,  # Expected 1800.0
        "total": 11200.0,
        "currency": "INR",
    }
    res = audit_invoice_data(inv)
    assert res["risk"] == "High"
    tax_issues = [i for i in res["issues"] if i["rule_code"] == "TAX_CALCULATION_MISMATCH"]
    assert len(tax_issues) == 1
    assert tax_issues[0]["actual"] == 1200.0
    assert tax_issues[0]["expected"] == 1800.0


def test_audit_invoice_total_mismatch():
    inv = {
        "invoice_number": "INV-104",
        "date": "2026-10-20",
        "seller_gstin": "27AAACR4849R4ZI",
        "buyer_gstin": "29AABCU9603R1ZJ",
        "taxable_value": 1000.0,
        "tax_rate": 0.18,
        "tax_amount": 180.0,
        "total": 1500.0,  # Expected 1180.0
        "currency": "INR",
    }
    res = audit_invoice_data(inv)
    assert res["risk"] == "High"
    total_issues = [i for i in res["issues"] if i["rule_code"] == "TOTAL_MISMATCH"]
    assert len(total_issues) == 1


def test_audit_invoice_non_inr_currency():
    inv = {
        "invoice_number": "INV-105",
        "date": "2026-10-20",
        "seller_gstin": "27AAACR4849R4ZI",
        "taxable_value": 1000.0,
        "tax_rate": 0.18,
        "tax_amount": 180.0,
        "total": 1180.0,
        "currency": "USD",
    }
    res = audit_invoice_data(inv)
    assert res["risk"] == "Medium"
    assert any(i["rule_code"] == "CURRENCY_NON_INR" for i in res["issues"])
