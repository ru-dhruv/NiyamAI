"""
Score Router (Feature 3).
Endpoints to recompute and fetch Compliance Health Score.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from backend.auth import AuthenticatedUser, get_current_user, verify_business_membership
from backend.services.score import recompute_and_save_score
from backend.db import get_db

router = APIRouter(prefix="/score", tags=["Health Score"])


class ScoreRecomputeRequest(BaseModel):
    business_id: str


@router.post("/recompute")
def recompute_score_endpoint(
    payload: ScoreRecomputeRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    POST /score/recompute
    Recomputes and stores the health score and breakdown for a business.
    """
    verify_business_membership(payload.business_id, user)
    result = recompute_and_save_score(payload.business_id)
    return result


@router.get("/{business_id}")
def get_score_endpoint(
    business_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Fetches the current score, breakdown, and penalty exposure for a business.
    """
    biz_data = verify_business_membership(business_id, user)
    return {
        "healthScore": biz_data.get("healthScore", 0),
        "scoreBreakdown": biz_data.get("scoreBreakdown", []),
        "penaltyExposure": biz_data.get("penaltyExposure", 0.0),
        "updatedAt": biz_data.get("scoreUpdatedAt"),
    }
