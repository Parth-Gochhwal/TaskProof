"""
Wallet & Ledger routes.
"""

from __future__ import annotations

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Transaction
from app.core.auth import require_auth
from app.core import ledger
from app.schemas.schemas import WalletOut, TransactionOut, RewardProofOut

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("", response_model=WalletOut)
def get_wallet(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get current user's wallet."""
    user = require_auth(authorization)
    wallet = ledger.get_wallet(db, user["uid"])
    if not wallet:
        return WalletOut(
            user_id=user["uid"],
            balance=0,
            reserved=0,
            total_earned=0,
            total_spent=0,
            address="",
            transactions=[],
        )

    txs = ledger.get_transactions(db, user["uid"])
    return WalletOut(
        user_id=wallet.user_id,
        balance=wallet.balance,
        reserved=wallet.reserved,
        total_earned=wallet.total_earned,
        total_spent=wallet.total_spent,
        address=wallet.address,
        transactions=[TransactionOut.model_validate(t) for t in txs],
    )


@router.get("/transactions", response_model=List[TransactionOut])
def get_transactions(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get current user's transactions."""
    user = require_auth(authorization)
    txs = ledger.get_transactions(db, user["uid"])
    return [TransactionOut.model_validate(t) for t in txs]


@router.get("/transactions/{tx_id}/proof", response_model=RewardProofOut)
def get_proof(
    tx_id: str,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Get verification proof for a transaction."""
    user = require_auth(authorization)
    proof = ledger.get_proof(db, tx_id)
    if not proof:
        raise HTTPException(status_code=404, detail="Proof not found for this transaction")
    return RewardProofOut.model_validate(proof)
