"""
Token-based authentication for normal users (student / parent).

Strategy:
- On login, generate a secure random token (32 bytes hex → 64 chars).
- Store { token: ..., user_id: ..., expires_at: ... } in MongoDB `auth_tokens` collection.
- The React frontend stores this token in localStorage and sends it as:
      Authorization: Bearer <token>
- @require_auth verifies the token from the Authorization header.
- On logout, the token document is deleted.

This is completely separate from the admin X-Admin-Password scheme.
"""

import secrets
from datetime import datetime, timezone, timedelta
from functools import wraps

from rest_framework.response import Response
from .db import db

auth_tokens = db["auth_tokens"]

# ----------------------------------------------------------
# Token TTL: 7 days
# ----------------------------------------------------------
TOKEN_TTL_HOURS = 7 * 24


def create_token(user_id: str) -> str:
    """Create and persist a new auth token for a user."""
    token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)
    auth_tokens.insert_one({
        "token": token,
        "user_id": user_id,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })
    return token


def get_user_from_token(token: str) -> dict | None:
    """Validate token and return user dict or None."""
    from .user_service import get_user_by_id
    if not token:
        return None
    doc = auth_tokens.find_one({"token": token})
    if not doc:
        return None
    # Check expiry
    expires_at = doc.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            auth_tokens.delete_one({"token": token})
            return None
    return get_user_by_id(doc["user_id"])


def delete_token(token: str) -> None:
    """Delete a token (logout)."""
    auth_tokens.delete_one({"token": token})


def _extract_token(request) -> str | None:
    """Pull Bearer token from Authorization header or HTTP_AUTHORIZATION."""
    auth_header = request.headers.get("Authorization", "") or request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None


def require_auth(view_func):
    """
    Decorator that checks for a valid user Bearer token.
    Attaches request.user_data = { user_id, name, email, role }.
    Returns 401 if not authenticated.
    """
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if request.method == "OPTIONS":
            return view_func(request, *args, **kwargs)
        token = _extract_token(request)
        user = get_user_from_token(token)
        if not user:
            return Response({"error": "Authentication required"}, status=401)
        request.user_data = user
        return view_func(request, *args, **kwargs)
    return _wrapped
