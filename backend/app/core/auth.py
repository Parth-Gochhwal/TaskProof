"""
Simple demo authentication.
Uses a signed token that encodes user_id + role.
No passwords, no OAuth — this is a prototype demo.
"""

from __future__ import annotations

import base64
import json
import hashlib
import hmac
import time
from typing import Optional, Dict, Any

# In a real app this would be an env var secret
_SECRET = b"taskproof-demo-secret-not-for-production"

# Demo user IDs (must match seed data)
DEMO_CONTRIBUTOR_ID = "user-contributor-demo"
DEMO_BUSINESS_ID = "user-business-demo"


def _encode_token(user_id: str, role: str) -> str:
    """Encode a simple signed token."""
    payload = json.dumps({"uid": user_id, "role": role, "ts": int(time.time())})
    payload_b64 = base64.urlsafe_b64encode(payload.encode()).decode()
    sig = hmac.new(_SECRET, payload_b64.encode(), hashlib.sha256).hexdigest()[:16]
    return f"{payload_b64}.{sig}"


def _decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a token. Returns None if invalid."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected_sig = hmac.new(_SECRET, payload_b64.encode(), hashlib.sha256).hexdigest()[:16]
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode())
        return payload
    except Exception:
        return None


def create_contributor_token() -> str:
    return _encode_token(DEMO_CONTRIBUTOR_ID, "contributor")


def create_business_token() -> str:
    return _encode_token(DEMO_BUSINESS_ID, "business")


def get_current_user(authorization: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Extract current user from Authorization header.
    Returns None if unauthenticated.
    """
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None
    return _decode_token(token)


def require_auth(authorization: Optional[str]) -> Dict[str, Any]:
    """Raise 401 if not authenticated."""
    from fastapi import HTTPException, status
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


def require_role(authorization: Optional[str], role: str) -> Dict[str, Any]:
    """Raise 401/403 if not authenticated or wrong role."""
    from fastapi import HTTPException, status
    user = require_auth(authorization)
    if user.get("role") != role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This endpoint requires role: {role}",
        )
    return user
