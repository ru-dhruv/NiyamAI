"""
GSTIN format and checksum validation using the standard Mod-36 (Luhn mod 36) algorithm.

A GSTIN is a 15-character alphanumeric string:
- 2 digits: State code (01-38, 97, 99)
- 10 characters: PAN (5 letters, 4 digits, 1 letter)
- 1 character: Entity code (1-9, A-Z)
- 1 character: Constant 'Z'
- 1 character: Check digit calculated using Mod-36
"""

import re
from typing import Dict, Any, Tuple

# Base-36 characters used in GSTIN check digit algorithm
GSTN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
MODULUS = 36

# Valid Indian state codes under GST
VALID_STATE_CODES = {
    "01": "Jammu and Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "25": "Daman and Diu",
    "26": "Dadra and Nagar Haveli",
    "27": "Maharashtra",
    "28": "Andhra Pradesh (Old)",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman and Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh (New)",
    "38": "Ladakh",
    "97": "Other Territory",
    "99": "Centre Jurisdiction",
}

# Regex pattern for structural check
GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


def calculate_gstin_check_digit(gstin_14: str) -> str:
    """
    Calculates the 15th check character for the first 14 characters of a GSTIN
    using the standard Mod-36 algorithm.
    """
    if len(gstin_14) != 14:
        raise ValueError("Input must be exactly 14 characters long.")

    factor = 1
    total_sum = 0

    for char in gstin_14.upper():
        if char not in GSTN_CHARS:
            raise ValueError(f"Invalid character '{char}' in GSTIN.")

        code_point = GSTN_CHARS.index(char)
        digit_product = code_point * factor
        # Alternate factor between 1 and 2
        factor = 2 if factor == 1 else 1

        # Sum quotient and remainder when divided by 36
        total_sum += (digit_product // MODULUS) + (digit_product % MODULUS)

    remainder = total_sum % MODULUS
    check_code_point = (MODULUS - remainder) % MODULUS
    return GSTN_CHARS[check_code_point]


def validate_gstin(gstin: str) -> Dict[str, Any]:
    """
    Validates a complete 15-character GSTIN.
    Returns a dict with 'valid' flag, detailed error message if invalid,
    and extracted components (state, pan, entity, check digit).
    """
    if not gstin or not isinstance(gstin, str):
        return {
            "valid": False,
            "gstin": gstin or "",
            "error": "GSTIN cannot be empty.",
            "rule_code": "GSTIN_INVALID",
        }

    cleaned = gstin.strip().upper()

    if len(cleaned) != 15:
        return {
            "valid": False,
            "gstin": cleaned,
            "error": f"GSTIN must be 15 characters long, found {len(cleaned)}.",
            "rule_code": "GSTIN_INVALID",
        }

    if not GSTIN_REGEX.match(cleaned):
        return {
            "valid": False,
            "gstin": cleaned,
            "error": "GSTIN format is invalid. Must follow pattern: 2 digits + 10 PAN chars + 1 entity char + 'Z' + 1 check char.",
            "rule_code": "GSTIN_INVALID",
        }

    state_code = cleaned[:2]
    pan = cleaned[2:12]
    entity_code = cleaned[12]
    constant_z = cleaned[13]
    actual_check_digit = cleaned[14]

    if constant_z != "Z":
        return {
            "valid": False,
            "gstin": cleaned,
            "error": f"14th character must be 'Z', found '{constant_z}'.",
            "rule_code": "GSTIN_INVALID",
        }

    try:
        expected_check_digit = calculate_gstin_check_digit(cleaned[:14])
    except Exception as e:
        return {
            "valid": False,
            "gstin": cleaned,
            "error": f"Error calculating check digit: {str(e)}",
            "rule_code": "GSTIN_INVALID",
        }

    if actual_check_digit != expected_check_digit:
        return {
            "valid": False,
            "gstin": cleaned,
            "error": f"Invalid check digit. Expected '{expected_check_digit}', but found '{actual_check_digit}'.",
            "rule_code": "GSTIN_INVALID",
            "expected_check_digit": expected_check_digit,
            "actual_check_digit": actual_check_digit,
        }

    state_name = VALID_STATE_CODES.get(state_code, "Unknown State")

    return {
        "valid": True,
        "gstin": cleaned,
        "state_code": state_code,
        "state_name": state_name,
        "pan": pan,
        "entity_code": entity_code,
        "check_digit": actual_check_digit,
        "error": None,
    }

