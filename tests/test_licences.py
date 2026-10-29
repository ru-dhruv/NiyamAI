"""
Unit tests for licence scanning validation and status computation (services/gemini.py).
"""

from datetime import date, timedelta
from backend.services.gemini import compute_licence_status, validate_licence_data, scan_licence


def test_compute_licence_status_valid():
    today = date.today()
    future_date = (today + timedelta(days=90)).isoformat()
    assert compute_licence_status(future_date) == "valid"


def test_compute_licence_status_expiring():
    today = date.today()
    expiring_soon = (today + timedelta(days=15)).isoformat()
    assert compute_licence_status(expiring_soon) == "expiring"


def test_compute_licence_status_expired():
    today = date.today()
    past_date = (today - timedelta(days=5)).isoformat()
    assert compute_licence_status(past_date) == "expired"
    assert compute_licence_status(None) == "expired"


def test_validate_licence_data_fssai_valid():
    today = date.today()
    data = {
        "licence_type": "FSSAI",
        "licence_number": "10014011001234",
        "holder_name": "Sharma Sweets",
        "issue_date": "2023-01-01",
        "expiry_date": (today + timedelta(days=120)).isoformat(),
        "confidence": 0.95,
        "is_licence": True,
    }
    validated = validate_licence_data(data)
    assert validated["status"] == "valid"
    assert validated["licence_number"] == "10014011001234"
    assert len(validated["warnings"]) == 0


def test_validate_licence_data_fssai_invalid_number():
    data = {
        "licence_type": "FSSAI",
        "licence_number": "12345",  # Not 14 digits
        "expiry_date": "2028-01-01",
        "confidence": 0.9,
    }
    validated = validate_licence_data(data)
    assert any("14 digits" in w for w in validated["warnings"])


def test_validate_licence_data_blurry_and_not_licence():
    data = {
        "licence_type": "Random Paper",
        "licence_number": "XYZ",
        "confidence": 0.40,  # low confidence
        "is_licence": False,
    }
    validated = validate_licence_data(data)
    assert any("Blurry image" in w for w in validated["warnings"])
    assert any("does not look like a licence" in w for w in validated["warnings"])
    assert any("Expiry date missing" in w for w in validated["warnings"])
