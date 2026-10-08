"""
Auth routes — demo login, me, logout.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, ContributorProfile, BusinessProfile
from app.core.auth import (
    create_contributor_token, create_business_token,
    require_auth, DEMO_CONTRIBUTOR_ID, DEMO_BUSINESS_ID
)
from app.schemas.schemas import DemoLoginResponse, MeResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/demo/contributor", response_model=DemoLoginResponse)
def login_as_contributor(db: Session = Depends(get_db)):  # type: ignore[misc]
    """Demo login as the contributor. Returns a bearer token."""
    user = db.query(User).filter(User.id == DEMO_CONTRIBUTOR_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo contributor not found. Run seed first.")
    token = create_contributor_token()
    return DemoLoginResponse(
        token=token,
        user_id=user.id,
        role=user.role,
        name=user.name,
        email=user.email,
    )


@router.post("/demo/business", response_model=DemoLoginResponse)
def login_as_business(db: Session = Depends(get_db)):  # type: ignore[misc]
    """Demo login as the business. Returns a bearer token."""
    user = db.query(User).filter(User.id == DEMO_BUSINESS_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo business not found. Run seed first.")
    token = create_business_token()
    return DemoLoginResponse(
        token=token,
        user_id=user.id,
        role=user.role,
        name=user.name,
        email=user.email,
    )


@router.get("/me", response_model=MeResponse)
def get_me(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Return current user info from token."""
    payload = require_auth(authorization)
    user = db.query(User).filter(User.id == payload["uid"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return MeResponse(
        user_id=user.id,
        role=user.role,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
    )


@router.post("/logout")
def logout():
    """Client-side logout — just acknowledge."""
    return {"success": True, "message": "Logged out"}
