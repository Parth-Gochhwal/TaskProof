"""
Task routes — CRUD for tasks.
"""

from __future__ import annotations

from typing import Optional, List
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Task, BusinessProfile
from app.core.auth import require_auth, require_role
from app.schemas.schemas import TaskCreate, TaskOut, TaskPatch

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskOut])
def get_tasks(
    category: Optional[str] = Query(default=None),
    difficulty: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Get all active tasks with optional filtering."""
    query = db.query(Task).filter(Task.status == "active")

    if category and category != "all":
        query = query.filter(Task.category == category)
    if difficulty:
        query = query.filter(Task.difficulty == difficulty)
    if q:
        ql = q.lower()
        query = query.filter(
            (Task.title.ilike(f"%{ql}%")) |
            (Task.description.ilike(f"%{ql}%")) |
            (Task.category.ilike(f"%{ql}%"))
        )

    return query.order_by(Task.created_at.desc()).all()


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """Get a specific task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskOut, status_code=201)
def create_task(
    body: TaskCreate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Create a new task (business only)."""
    user = require_role(authorization, "business")

    task_id = "task-" + uuid.uuid4().hex[:8]
    task = Task(
        id=task_id,
        title=body.title,
        category=body.category,
        description=body.description,
        short_description=body.short_description,
        reward=body.reward,
        estimated_minutes=body.estimated_minutes,
        difficulty=body.difficulty,
        slots=body.slots,
        remaining_slots=body.slots,
        quality_score=0.0,
        status="active",
        business_id=user["uid"],
        business_name=body.business_name,
        tags=body.tags,
        requirements=body.requirements,
        input_fields=body.input_fields,
        image_url=body.image_url,
        created_at=datetime.now(timezone.utc),
    )
    db.add(task)

    # Update business profile stats
    biz_profile = db.query(BusinessProfile).filter(
        BusinessProfile.user_id == user["uid"]
    ).first()
    if biz_profile:
        biz_profile.tasks_created += 1

    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    body: TaskPatch,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Update a task (business owner only)."""
    user = require_role(authorization, "business")

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.business_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Not your task")

    if body.status is not None:
        task.status = body.status
    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description

    db.commit()
    db.refresh(task)
    return task
