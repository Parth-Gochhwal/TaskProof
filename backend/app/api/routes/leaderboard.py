"""
Leaderboard route.
"""

from __future__ import annotations

from typing import Optional, List
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ContributorProfile, User
from app.core.auth import get_current_user
from app.schemas.schemas import LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get top contributor leaderboard."""
    current_user = get_current_user(authorization)
    current_uid = current_user["uid"] if current_user else None

    profiles = (
        db.query(ContributorProfile, User)
        .join(User, ContributorProfile.user_id == User.id)
        .order_by(ContributorProfile.tasks_completed.desc(), ContributorProfile.xp.desc())
        .limit(20)
        .all()
    )

    entries = []
    for rank, (profile, user) in enumerate(profiles, start=1):
        entries.append(LeaderboardEntry(
            rank=rank,
            user_id=profile.user_id,
            name=user.name,
            avatar=user.avatar,
            level=profile.level,
            level_name=profile.level_name,
            tasks_completed=profile.tasks_completed,
            quality_score=profile.quality_score,
            total_earned=profile.total_earned,
            is_current_user=(profile.user_id == current_uid),
        ))

    return entries
