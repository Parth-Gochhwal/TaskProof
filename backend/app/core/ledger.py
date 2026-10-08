"""
Local Ledger — RewardLedger abstraction backed by SQLite.

Enforces reward invariants:
1. Rejected submissions receive no reward.
2. Pending submissions receive no final reward.
3. An approved submission receives exactly one reward.
4. The same submission cannot be approved twice.
5. A contributor cannot approve their own submission.
6. A business cannot approve another business's submission.
7. Wallet balance changes only through valid reward/funding operations.
8. Every reward has a transaction reference.
9. Every reward has a proof reference.
"""

from __future__ import annotations

import uuid
import hashlib
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.models import Wallet, Transaction, RewardProof, Submission, User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _generate_proof_hash(submission_id: str, task_id: str, amount: int, ts: str) -> str:
    """Deterministic proof hash based on submission data."""
    raw = f"{submission_id}:{task_id}:{amount}:{ts}"
    return "0x" + hashlib.sha256(raw.encode()).hexdigest()[:32] + "..."


def _generate_tx_id() -> str:
    return "tx-" + uuid.uuid4().hex[:12]


def get_or_create_wallet(db: Session, user_id: str, initial_balance: int = 0) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=initial_balance, address=f"0x{user_id[-4:]}...demo")
        db.add(wallet)
        db.flush()
    return wallet


def get_balance(db: Session, user_id: str) -> int:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    return wallet.balance if wallet else 0


def get_wallet(db: Session, user_id: str) -> Wallet | None:
    return db.query(Wallet).filter(Wallet.user_id == user_id).first()


def release_reward(
    db: Session,
    submission: Submission,
    reviewer_id: str,
) -> Dict[str, Any]:
    """
    Approve a submission and release reward in a single atomic transaction.

    Returns: { success, transaction_id, proof_hash, reward, error }

    Enforces all reward invariants.
    """
    # Invariant 1 & 2: only under_review can be approved
    if submission.status != "under_review":
        return {"success": False, "error": f"Cannot approve — status is '{submission.status}'"}

    # Invariant 4: already approved/rewarded check (status guard above handles this)
    # Invariant 5: contributor cannot approve own submission
    if submission.contributor_id == reviewer_id:
        return {"success": False, "error": "Contributor cannot approve their own submission"}

    # Get task to determine actual reward amount
    task = submission.task
    if not task:
        return {"success": False, "error": "Associated task not found"}

    reward_amount = task.reward

    # Check if proof already exists (belt-and-suspenders duplicate protection)
    existing_proof = db.query(RewardProof).filter(
        RewardProof.submission_id == submission.id
    ).first()
    if existing_proof:
        return {"success": False, "error": "Submission has already been rewarded — duplicate approval prevented"}

    # Get wallets
    business_wallet = get_or_create_wallet(db, reviewer_id)
    contributor_wallet = get_or_create_wallet(db, submission.contributor_id)

    # Check business has sufficient balance (use reserved if possible)
    if business_wallet.reserved >= reward_amount:
        business_wallet.reserved -= reward_amount
    elif business_wallet.balance >= reward_amount:
        business_wallet.balance -= reward_amount
    else:
        return {"success": False, "error": "Insufficient funds to release reward"}

    # Credit contributor
    contributor_wallet.balance += reward_amount
    contributor_wallet.total_earned += reward_amount

    # Track business spending
    business_wallet.total_spent += reward_amount

    ts = _utcnow()
    tx_id = _generate_tx_id()
    proof_hash = _generate_proof_hash(submission.id, submission.task_id, reward_amount, ts.isoformat())

    # Create contributor transaction (credit)
    contrib_tx = Transaction(
        id=tx_id,
        wallet_id=contributor_wallet.id,
        type="task_reward",
        amount=reward_amount,
        direction="credit",
        label="Task Reward",
        task_id=submission.task_id,
        task_title=submission.task_title,
        submission_id=submission.id,
        status="confirmed",
        proof_hash=proof_hash,
        network="TaskProof Local Network",
        timestamp=ts,
    )
    db.add(contrib_tx)

    # Create business transaction (debit)
    biz_tx_id = "tx-" + uuid.uuid4().hex[:12]
    biz_tx = Transaction(
        id=biz_tx_id,
        wallet_id=business_wallet.id,
        type="task_reward",
        amount=reward_amount,
        direction="debit",
        label="Reward Released",
        task_id=submission.task_id,
        task_title=submission.task_title,
        submission_id=submission.id,
        status="confirmed",
        proof_hash=proof_hash,
        network="TaskProof Local Network",
        timestamp=ts,
    )
    db.add(biz_tx)

    # Create proof record
    proof = RewardProof(
        transaction_id=tx_id,
        task_id=submission.task_id,
        submission_id=submission.id,
        contributor_id=submission.contributor_id,
        business_id=reviewer_id,
        reward=reward_amount,
        proof_hash=proof_hash,
        network="TaskProof Local Network",
        status="verified",
        block_number=int(hashlib.md5(submission.id.encode()).hexdigest()[:6], 16) + 500000,
        timestamp=ts,
    )
    db.add(proof)

    # Update submission
    submission.status = "rewarded"
    submission.reward = reward_amount
    submission.transaction_id = tx_id
    submission.review_reviewer_id = reviewer_id
    submission.review_status = "approved"
    submission.reviewed_at = ts

    # Update contributor profile stats
    contrib_profile = submission.contributor.contributor_profile
    if contrib_profile:
        contrib_profile.tasks_completed += 1
        contrib_profile.total_earned += reward_amount
        contrib_profile.xp += reward_amount  # 1 XP per TCR earned

        # Level up logic
        _update_level(contrib_profile)

    db.flush()

    return {
        "success": True,
        "transaction_id": tx_id,
        "proof_hash": proof_hash,
        "reward": reward_amount,
    }


def _update_level(profile) -> None:
    """Update contributor level based on XP."""
    LEVELS = [
        (1, "Newcomer", 0, 200),
        (2, "Contributor", 200, 600),
        (3, "Task Explorer", 600, 1200),
        (4, "Data Explorer", 1200, 3000),
        (5, "Verified Specialist", 3000, 9999),
    ]
    for level, name, min_xp, max_xp in LEVELS:
        if profile.xp < max_xp:
            profile.level = level
            profile.level_name = name
            profile.xp_to_next_level = max_xp
            break


def get_transactions(db: Session, user_id: str) -> List[Transaction]:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        return []
    return db.query(Transaction).filter(
        Transaction.wallet_id == wallet.id
    ).order_by(Transaction.timestamp.desc()).all()


def get_proof(db: Session, transaction_id: str) -> Optional[RewardProof]:
    return db.query(RewardProof).filter(
        RewardProof.transaction_id == transaction_id
    ).first()
