"""
Unit tests for GSTIN format and Mod-36 checksum validation (services/gstin.py).
"""

import pytest
from backend.services.gstin import calculate_gstin_check_digit, validate_gstin


def test_calculate_gstin_check_digit_valid():
    # Known valid GSTINs
    # 27AAACR4849R4Z + I -> 27AAACR4849R4ZI
    check = calculate_gstin_check_digit("27AAACR4849R4Z")
    assert check == "I"

    # 29AABCU9603R1Z + J -> 29AABCU9603R1ZJ
    check2 = calculate_gstin_check_digit("29AABCU9603R1Z")
    assert check2 == "J"

    # 07AAAAA0000A1Z + 5
    check3 = calculate_gstin_check_digit("07AAAAA0000A1Z")
    assert isinstance(check3, str)
    assert len(check3) == 1


def test_validate_gstin_success():
    res = validate_gstin("27AAACR4849R4ZI")
    assert res["valid"] is True
    assert res["state_code"] == "27"
    assert res["state_name"] == "Maharashtra"
    assert res["pan"] == "AAACR4849R"
    assert res["error"] is None


def test_validate_gstin_invalid_check_digit():
    # Tampered check digit 'X' instead of 'I'
    res = validate_gstin("27AAACR4849R4ZX")
    assert res["valid"] is False
    assert res["rule_code"] == "GSTIN_INVALID"
    assert "Expected 'I'" in res["error"]


def test_validate_gstin_invalid_length():
    res = validate_gstin("27AAACR4849R4Z")  # 14 chars
    assert res["valid"] is False
    assert res["rule_code"] == "GSTIN_INVALID"
    assert "15 characters long" in res["error"]


def test_validate_gstin_invalid_constant_z():
    # 14th character must be 'Z'
    res = validate_gstin("27AAACR4849R4AI")
    assert res["valid"] is False
    assert res["rule_code"] == "GSTIN_INVALID"


def test_validate_gstin_empty():
    res = validate_gstin("")
    assert res["valid"] is False
    assert res["rule_code"] == "GSTIN_INVALID"
