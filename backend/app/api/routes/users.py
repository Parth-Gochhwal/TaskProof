"""
User / Profile routes.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, ContributorProfile, BusinessProfile
from app.core.auth import require_auth
from app.schemas.schemas import (
    ContributorProfileOut, BusinessProfileOut, ContributorProfilePatch
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/profile")
def get_my_profile(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get current user's full profile."""
    user = require_auth(authorization)

    if user["role"] == "contributor":
        profile = db.query(ContributorProfile).filter(
            ContributorProfile.user_id == user["uid"]
        ).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return ContributorProfileOut.model_validate(profile)
    else:
        profile = db.query(BusinessProfile).filter(
            BusinessProfile.user_id == user["uid"]
        ).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return BusinessProfileOut.model_validate(profile)


@router.patch("/me/profile", response_model=ContributorProfileOut)
def update_my_profile(
    body: ContributorProfilePatch,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Update contributor profile."""
    user = require_auth(authorization)
    if user["role"] != "contributor":
        raise HTTPException(status_code=403, detail="Only contributors can update profiles this way")

    profile = db.query(ContributorProfile).filter(
        ContributorProfile.user_id == user["uid"]
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if body.bio is not None:
        profile.bio = body.bio
    if body.college is not None:
        profile.college = body.college
    if body.skills is not None:
        profile.skills = body.skills

    db.commit()
    db.refresh(profile)
    return ContributorProfileOut.model_validate(profile)
