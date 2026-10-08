"""
Pydantic schemas for request/response serialization.
Mirror of TypeScript types in src/types/models.ts
"""

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base model that automatically converts snake_case to camelCase for JSON."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )


# ============================
# Auth
# ============================

class DemoLoginResponse(CamelModel):
    token: str
    user_id: str
    role: str
    name: str
    email: str


class MeResponse(CamelModel):
    user_id: str
    role: str
    name: str
    email: str
    avatar: Optional[str] = None


# ============================
# User
# ============================

class UserOut(CamelModel):
    id: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    created_at: datetime


# ============================
# Contributor Profile
# ============================

class ContributorProfileOut(CamelModel):
    user_id: str
    username: str
    bio: Optional[str] = None
    college: Optional[str] = None
    skills: list[str]
    level: int
    level_name: str
    xp: int
    xp_to_next_level: int
    streak: int
    tasks_completed: int
    quality_score: float
    rating: float
    total_earned: int
    wallet_address: str
    badges: list[Any]
    joined_at: datetime


class ContributorProfilePatch(CamelModel):
    bio: Optional[str] = None
    college: Optional[str] = None
    skills: Optional[list[str]] = None


# ============================
# Business Profile
# ============================

class BusinessProfileOut(CamelModel):
    user_id: str
    company_name: str
    industry: str
    website: Optional[str] = None
    tasks_created: int
    total_spent: int
    approval_rate: float
    joined_at: datetime


# ============================
# Task
# ============================

class TaskCreate(CamelModel):
    title: str
    category: str
    description: str
    short_description: str
    reward: int
    estimated_minutes: int = 10
    difficulty: str
    slots: int
    tags: list[str] = []
    requirements: list[Any] = []
    input_fields: list[Any] = []
    business_name: str
    image_url: Optional[str] = None


class TaskOut(CamelModel):
    id: str
    title: str
    category: str
    description: str
    short_description: str
    reward: int
    estimated_minutes: int
    difficulty: str
    slots: int
    remaining_slots: int
    quality_score: float
    status: str
    business_id: str
    business_name: str
    tags: list[str]
    requirements: list[Any]
    input_fields: list[Any]
    image_url: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None


class TaskPatch(CamelModel):
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


# ============================
# Submission
# ============================

class SubmissionCreate(CamelModel):
    data: dict[str, Any]


class ReviewOut(CamelModel):
    reviewer_id: str
    status: str
    feedback: Optional[str] = None
    reviewed_at: datetime


class SubmissionOut(CamelModel):
    id: str
    task_id: str
    task_title: str
    contributor_id: str
    contributor_name: str
    contributor_level: int
    data: dict[str, Any]
    status: str
    automated_checks: list[Any]
    review: Optional[ReviewOut] = None
    reward: Optional[int] = None
    transaction_id: Optional[str] = None
    submitted_at: datetime

    @classmethod
    def from_orm_with_review(cls, obj: Any) -> "SubmissionOut":
        review = None
        if obj.review_reviewer_id:
            review = ReviewOut(
                reviewer_id=obj.review_reviewer_id,
                status=obj.review_status or "unknown",
                feedback=obj.review_feedback,
                reviewed_at=obj.reviewed_at or obj.submitted_at,
            )
        return cls(
            id=obj.id,
            task_id=obj.task_id,
            task_title=obj.task_title,
            contributor_id=obj.contributor_id,
            contributor_name=obj.contributor_name,
            contributor_level=obj.contributor_level,
            data=obj.data or {},
            status=obj.status,
            automated_checks=obj.automated_checks or [],
            review=review,
            reward=obj.reward,
            transaction_id=obj.transaction_id,
            submitted_at=obj.submitted_at,
        )


class ApproveRequest(CamelModel):
    feedback: Optional[str] = None


class RejectRequest(CamelModel):
    feedback: str


class ActionResponse(CamelModel):
    success: bool
    message: str
    reward: Optional[int] = None
    transaction_id: Optional[str] = None
    proof_hash: Optional[str] = None


# ============================
# Wallet & Transactions
# ============================

class TransactionOut(CamelModel):
    id: str
    type: str
    amount: int
    direction: str
    label: str
    task_id: Optional[str] = None
    task_title: Optional[str] = None
    submission_id: Optional[str] = None
    status: str
    proof_hash: Optional[str] = None
    network: str
    timestamp: datetime


class WalletOut(CamelModel):
    user_id: str
    balance: int
    reserved: int
    total_earned: int
    total_spent: int
    address: str
    transactions: list[TransactionOut]


# ============================
# Reward Proof
# ============================

class RewardProofOut(CamelModel):
    transaction_id: str
    task_id: str
    submission_id: str
    contributor_id: str
    business_id: str
    reward: int
    proof_hash: str
    network: str
    status: str
    block_number: Optional[int] = None
    timestamp: datetime


# ============================
# Leaderboard
# ============================

class LeaderboardEntry(CamelModel):
    rank: int
    user_id: str
    name: str
    avatar: Optional[str] = None
    level: int
    level_name: str
    tasks_completed: int
    quality_score: float
    total_earned: int
    is_current_user: bool = False


# ============================
# Business Analytics
# ============================

class BusinessAnalyticsOut(CamelModel):
    tasks_created: int
    total_submissions: int
    approved: int
    rejected: int
    under_review: int
    completion_rate: float
    approval_rate: float
    avg_review_time_hours: float
    avg_reward: float
    total_spent: int
    quality_score: float
    submissions_over_time: list[dict]
    approval_rate_over_time: list[dict]


# ============================
# Health
# ============================

class HealthResponse(CamelModel):
    status: str
    service: str
    version: str
    database: str
