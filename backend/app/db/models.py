"""
SQLAlchemy ORM models for TaskProof.
Mapped from src/types/models.ts

Uses classic SQLAlchemy column style (not Mapped[]) for Python 3.14 compatibility
with SQLAlchemy 2.0.36, which has known issues with Python 3.14 union type resolution.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    String, Integer, Float, Text, DateTime,
    ForeignKey, JSON, Column, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.db.database import Base


def utcnow():
    return datetime.now(timezone.utc)


# ============================
# User
# ============================

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    avatar = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    contributor_profile = relationship("ContributorProfile", back_populates="user", uselist=False)
    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    submissions = relationship("Submission", back_populates="contributor",
                               foreign_keys="Submission.contributor_id")


# ============================
# ContributorProfile
# ============================

class ContributorProfile(Base):
    __tablename__ = "contributor_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    username = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    college = Column(String(255), nullable=True)
    skills = Column(JSON, default=list)
    level = Column(Integer, default=1)
    level_name = Column(String(100), default="Newcomer")
    xp = Column(Integer, default=0)
    xp_to_next_level = Column(Integer, default=200)
    streak = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    quality_score = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    total_earned = Column(Integer, default=0)
    wallet_address = Column(String(255), default="")
    badges = Column(JSON, default=list)
    joined_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="contributor_profile")


# ============================
# BusinessProfile
# ============================

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(255), nullable=False)
    website = Column(String(512), nullable=True)
    tasks_created = Column(Integer, default=0)
    total_spent = Column(Integer, default=0)
    approval_rate = Column(Float, default=0.0)
    joined_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="business_profile")
    # NOTE: Tasks link to User.id, so no direct FK to business_profiles.


# ============================
# Task
# ============================

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True)
    title = Column(String(500), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=False)
    reward = Column(Integer, nullable=False)
    estimated_minutes = Column(Integer, default=10)
    difficulty = Column(String(20), default="easy")
    slots = Column(Integer, default=100)
    remaining_slots = Column(Integer, default=100)
    quality_score = Column(Float, default=0.0)
    status = Column(String(20), default="active")
    business_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    business_name = Column(String(255), nullable=False)
    tags = Column(JSON, default=list)
    requirements = Column(JSON, default=list)
    input_fields = Column(JSON, default=list)
    image_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # business = relationship removed — Task.business_id -> User.id, no FK to business_profiles
    submissions = relationship("Submission", back_populates="task")


# ============================
# Submission
# ============================

class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        UniqueConstraint("task_id", "contributor_id", name="uq_task_contributor"),
    )

    id = Column(String(64), primary_key=True)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    task_title = Column(String(500), nullable=False)
    contributor_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    contributor_name = Column(String(255), nullable=False)
    contributor_level = Column(Integer, default=1)
    data = Column(JSON, default=dict)
    status = Column(String(30), default="submitted")
    automated_checks = Column(JSON, default=list)
    # Review fields stored inline
    review_reviewer_id = Column(String(64), nullable=True)
    review_status = Column(String(20), nullable=True)
    review_feedback = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    # Reward
    reward = Column(Integer, nullable=True)
    transaction_id = Column(String(64), nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=utcnow)

    task = relationship("Task", back_populates="submissions")
    contributor = relationship("User", back_populates="submissions",
                               foreign_keys="Submission.contributor_id")


# ============================
# Wallet
# ============================

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Integer, default=0)
    reserved = Column(Integer, default=0)
    total_earned = Column(Integer, default=0)
    total_spent = Column(Integer, default=0)
    address = Column(String(255), default="")

    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet",
                                order_by="Transaction.timestamp.desc()")


# ============================
# Transaction
# ============================

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    type = Column(String(30), nullable=False)
    amount = Column(Integer, nullable=False)
    direction = Column(String(10), nullable=False)
    label = Column(String(255), nullable=False)
    task_id = Column(String(64), nullable=True)
    task_title = Column(String(500), nullable=True)
    submission_id = Column(String(64), nullable=True)
    status = Column(String(20), default="confirmed")
    proof_hash = Column(String(255), nullable=True)
    network = Column(String(100), default="TaskProof Local Network")
    timestamp = Column(DateTime(timezone=True), default=utcnow)

    wallet = relationship("Wallet", back_populates="transactions")


# ============================
# RewardProof
# ============================

class RewardProof(Base):
    __tablename__ = "reward_proofs"
    __table_args__ = (
        UniqueConstraint("submission_id", name="uq_proof_submission"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(String(64), unique=True, nullable=False)
    task_id = Column(String(64), nullable=False)
    submission_id = Column(String(64), nullable=False)
    contributor_id = Column(String(64), nullable=False)
    business_id = Column(String(64), nullable=False)
    reward = Column(Integer, nullable=False)
    proof_hash = Column(String(255), nullable=False)
    network = Column(String(100), nullable=False)
    status = Column(String(20), default="verified")
    block_number = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
