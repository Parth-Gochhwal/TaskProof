"""
Submission routes — create, list, approve, reject.
"""

from __future__ import annotations

from typing import Optional, List
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Task, Submission, User
from app.core.auth import require_auth, require_role
from app.core.checks import run_automated_checks, checks_all_passed
from app.core import ledger
from app.schemas.schemas import (
    SubmissionCreate, SubmissionOut, ApproveRequest, RejectRequest, ActionResponse
)

router = APIRouter(tags=["submissions"])


def _submission_to_out(sub: Submission) -> SubmissionOut:
    return SubmissionOut.from_orm_with_review(sub)


# ============================
# Contributor: create submission
# ============================

@router.post("/tasks/{task_id}/submissions", response_model=SubmissionOut, status_code=201)
def create_submission(
    task_id: str,
    body: SubmissionCreate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Submit a task response (contributor only)."""
    user = require_role(authorization, "contributor")

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != "active":
        raise HTTPException(status_code=400, detail="Task is not accepting submissions")
    if task.remaining_slots <= 0:
        raise HTTPException(status_code=400, detail="No remaining slots")

    # Check for duplicate (DB constraint will also catch this, but give a nicer error)
    existing = db.query(Submission).filter(
        Submission.task_id == task_id,
        Submission.contributor_id == user["uid"],
        Submission.status != "rejected",
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already submitted this task")

    # Get contributor info
    contributor = db.query(User).filter(User.id == user["uid"]).first()
    contributor_level = 1
    contributor_name = contributor.name if contributor else "Unknown"
    if contributor and contributor.contributor_profile:
        contributor_level = contributor.contributor_profile.level

    # Run automated checks
    all_subs = db.query(Submission).filter(
        Submission.task_id == task_id
    ).all()
    checks = run_automated_checks(
        data=body.data,
        input_fields=task.input_fields or [],
        existing_submissions=all_subs,
        contributor_id=user["uid"],
        task_id=task_id,
    )
    all_passed = checks_all_passed(checks)

    sub_id = "sub-" + uuid.uuid4().hex[:8]
    submission = Submission(
        id=sub_id,
        task_id=task_id,
        task_title=task.title,
        contributor_id=user["uid"],
        contributor_name=contributor_name,
        contributor_level=contributor_level,
        data=body.data,
        status="under_review" if all_passed else "submitted",
        automated_checks=checks,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(submission)

    # Decrement task slot
    task.remaining_slots = max(0, task.remaining_slots - 1)

    db.commit()
    db.refresh(submission)
    return _submission_to_out(submission)


# ============================
# Contributor: my submissions
# ============================

@router.get("/submissions/mine", response_model=List[SubmissionOut])
def get_my_submissions(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get all submissions by the current contributor."""
    user = require_role(authorization, "contributor")
    subs = db.query(Submission).filter(
        Submission.contributor_id == user["uid"]
    ).order_by(Submission.submitted_at.desc()).all()
    return [_submission_to_out(s) for s in subs]


# ============================
# Business: get all submissions for my tasks
# ============================

@router.get("/submissions", response_model=List[SubmissionOut])
def get_all_submissions(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    Business: get all submissions for tasks owned by this business.
    Contributor: get their own submissions.
    """
    user = require_auth(authorization)

    if user["role"] == "business":
        task_ids_query = db.query(Task.id).filter(Task.business_id == user["uid"])
        task_ids = [r[0] for r in task_ids_query.all()]
        if not task_ids:
            return []
        subs = db.query(Submission).filter(
            Submission.task_id.in_(task_ids)
        ).order_by(Submission.submitted_at.desc()).all()
    else:
        subs = db.query(Submission).filter(
            Submission.contributor_id == user["uid"]
        ).order_by(Submission.submitted_at.desc()).all()

    return [_submission_to_out(s) for s in subs]


@router.get("/submissions/{submission_id}", response_model=SubmissionOut)
def get_submission(
    submission_id: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get a specific submission."""
    user = require_auth(authorization)
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Authorization
    if user["role"] == "contributor" and sub.contributor_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    if user["role"] == "business":
        task = db.query(Task).filter(Task.id == sub.task_id).first()
        if not task or task.business_id != user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")

    return _submission_to_out(sub)


# ============================
# Business: approve
# ============================

@router.post("/submissions/{submission_id}/approve", response_model=ActionResponse)
def approve_submission(
    submission_id: str,
    body: ApproveRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    Approve a submission and release reward (business only).
    Atomic operation — all state changes succeed or none commit.
    """
    user = require_role(authorization, "business")

    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Verify this business owns the task
    task = db.query(Task).filter(Task.id == sub.task_id).first()
    if not task or task.business_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to review this submission")

    # Invariant 4: Duplicate approval protection
    if sub.status in ("approved", "rewarded"):
        raise HTTPException(
            status_code=409,
            detail="This submission has already been approved. Duplicate reward prevented."
        )

    result = ledger.release_reward(db=db, submission=sub, reviewer_id=user["uid"])

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    # Update review feedback if provided
    if body.feedback:
        sub.review_feedback = body.feedback

    db.commit()

    return ActionResponse(
        success=True,
        message="Submission approved. Reward released.",
        reward=result["reward"],
        transaction_id=result["transaction_id"],
        proof_hash=result["proof_hash"],
    )


# ============================
# Business: reject
# ============================

@router.post("/submissions/{submission_id}/reject", response_model=ActionResponse)
def reject_submission(
    submission_id: str,
    body: RejectRequest,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Reject a submission with mandatory feedback (business only)."""
    user = require_role(authorization, "business")

    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Verify this business owns the task
    task = db.query(Task).filter(Task.id == sub.task_id).first()
    if not task or task.business_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Not authorized to review this submission")

    if sub.status not in ("under_review", "submitted"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject — submission status is '{sub.status}'"
        )

    ts = datetime.now(timezone.utc)
    sub.status = "rejected"
    sub.review_reviewer_id = user["uid"]
    sub.review_status = "rejected"
    sub.review_feedback = body.feedback
    sub.reviewed_at = ts

    db.commit()

    return ActionResponse(success=True, message="Submission rejected.")
