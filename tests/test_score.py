"""
Unit tests for Compliance Health Score calculation (services/score.py).
"""

from datetime import date, datetime, timedelta, timezone
from backend.services.score import (
    calculate_licences_score,
    calculate_invoices_score,
    calculate_flags_score,
    calculate_deadlines_score,
    compute_health_score,
)


def test_calculate_licences_score_all_valid():
    required = ["FSSAI", "Trade Licence"]
    today = date.today()
    licences = [
        {"type": "FSSAI", "expiry": (today + timedelta(days=100)).isoformat()},
        {"type": "Trade Licence", "expiry": (today + timedelta(days=60)).isoformat()},
    ]
    res = calculate_licences_score(required, licences)
    assert res["score"] == 40
    assert res["lost"] == 0


def test_calculate_licences_score_one_expiring_one_missing():
    required = ["FSSAI", "Trade Licence"]
    today = date.today()
    licences = [
        # Expiring within 30 days (gets half score: 0.5)
        {"type": "FSSAI", "expiry": (today + timedelta(days=10)).isoformat()},
        # Trade Licence is missing (gets 0.0)
    ]
    # Average = (0.5 + 0.0) / 2 = 0.25 -> 40 * 0.25 = 10 points
    res = calculate_licences_score(required, licences)
    assert res["score"] == 10
    assert res["lost"] == 30
    assert res["penalty"] > 0


def test_calculate_invoices_score():
    # 3 invoices: 2 Low risk, 1 High risk
    today = date.today()
    invoices = [
        {"risk": "Low", "extracted": {"date": today.isoformat()}},
        {"risk": "Low", "extracted": {"date": today.isoformat()}},
        {"risk": "High", "extracted": {"date": today.isoformat()}},
    ]
    # 2/3 * 30 = 20 points
    res = calculate_invoices_score(invoices)
    assert res["score"] == 20
    assert res["lost"] == 10


def test_calculate_flags_score():
    now = datetime.now(timezone.utc)
    # 1 flag 2 days old (not overdue), 1 flag 10 days old (overdue)
    flags = [
        {"status": "open", "createdAt": (now - timedelta(days=2)).isoformat()},
        {"status": "open", "createdAt": (now - timedelta(days=10)).isoformat()},
    ]
    res = calculate_flags_score(flags)
    # 1 overdue flag -> 15 - 5 = 10
    assert res["score"] == 10
    assert res["lost"] == 5


def test_compute_health_score_breakdown_sorted():
    biz = {"type": "food"}
    required = ["FSSAI", "Trade Licence", "Fire NOC", "GST"]
    today = date.today()

    # All licences missing -> lost 40
    licences = []
    # Clean invoices -> lost 0
    invoices = []
    # No flags -> lost 0
    flags = []

    res = compute_health_score(biz, licences, invoices, flags, [])
    # 0 + 30 + 15 + 15 = 60
    assert res["healthScore"] == 60

    # Ensure scoreBreakdown is sorted descending by points lost
    breakdown = res["scoreBreakdown"]
    assert len(breakdown) == 4
    for i in range(len(breakdown) - 1):
        assert breakdown[i]["lost"] >= breakdown[i + 1]["lost"]

    # Licences lost 40 so it must be first
    assert breakdown[0]["category"] == "Licences"
    assert breakdown[0]["lost"] == 40
