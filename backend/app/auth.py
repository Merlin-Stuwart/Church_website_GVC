import os
import hmac
import hashlib
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, Header

AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "your_long_random_secret_key_here_gvc_church_2026")
if len(AUTH_SECRET_KEY) < 32:
    AUTH_SECRET_KEY = AUTH_SECRET_KEY.ljust(32, "x")


def create_admin_token(user_id: str) -> str:
    """Creates a cryptographically signed HMAC-SHA256 session token with timestamp."""
    timestamp = int(datetime.now().timestamp())
    body = f"{user_id}:{timestamp}"
    signature = hmac.new(AUTH_SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{user_id}.{timestamp}.{signature}"


def verify_admin_session(authorization: Optional[str] = Header(None)) -> bool:
    """
    Cryptographically verifies incoming admin HMAC token.
    Enforces server-signed validity and 7-day expiration.
    Rejects any forged, tampered, or expired tokens with 401.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Admin authorization required. Please login with your church admin credentials."
        )
    raw = authorization.replace("Bearer ", "").strip()
    if not raw:
        raise HTTPException(status_code=401, detail="Session token required.")

    # Validate HMAC signed token format: user_id.timestamp.signature
    parts = raw.split(".")
    if len(parts) == 3:
        user_id, timestamp_str, sig = parts
        try:
            timestamp = int(timestamp_str)
            body = f"{user_id}:{timestamp}"
            expected_sig = hmac.new(AUTH_SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
            if hmac.compare_digest(expected_sig, sig):
                # Verify 7-day expiration (7 * 86400 seconds) with 5-min clock skew tolerance
                if not -300 <= datetime.now().timestamp() - timestamp <= 7 * 86400:
                    raise HTTPException(status_code=401, detail="Admin session expired. Please re-login.")
                return True
        except ValueError:
            pass

    raise HTTPException(status_code=401, detail="Invalid admin session token. Access denied.")
