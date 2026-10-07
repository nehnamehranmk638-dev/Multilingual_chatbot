import secrets
from datetime import datetime, timezone, timedelta
from functools import wraps
from rest_framework.response import Response
from decouple import config
from .db import db

admin_tokens = db["admin_tokens"]
ADMIN_TOKEN_TTL_HOURS = 24  # Admin tokens expire after 24 hours


def create_admin_token(user) -> str:
    """Create and persist a new admin auth token for a Django User."""
    token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=ADMIN_TOKEN_TTL_HOURS)
    admin_tokens.insert_one({
        "token": token,
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })
    return token


def get_admin_from_token(token: str) -> dict | None:
    """Validate admin token and return admin info dict or None."""
    if not token:
        return None
    doc = admin_tokens.find_one({"token": token})
    if not doc:
        return None
    # Check expiry
    expires_at = doc.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            admin_tokens.delete_one({"token": token})
            return None
    return {
        "id": doc.get("user_id"),
        "username": doc.get("username"),
        "email": doc.get("email"),
        "is_staff": doc.get("is_staff", True),
        "is_superuser": doc.get("is_superuser", False),
    }


def delete_admin_token(token: str) -> None:
    """Delete an admin token on logout."""
    if token:
        admin_tokens.delete_one({"token": token})


def _extract_bearer_token(request) -> str | None:
    """Extract Bearer token from request headers or META."""
    auth_header = request.headers.get("Authorization", "") or request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None


def require_admin(view_func):
    """
    Decorator that checks for administrator privileges:
    1. Checks for a valid Bearer token in the `admin_tokens` collection (Django admin login).
    2. Checks for an authenticated Django session user with is_staff or is_superuser.
    3. Fallback: checks X-Admin-Password header for legacy/script compatibility.
    Rejects normal student/parent tokens and unauthenticated requests with 401.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.method == 'OPTIONS':
            return view_func(request, *args, **kwargs)

        # 1. Check Bearer token in admin_tokens collection
        token = _extract_bearer_token(request)
        if token:
            admin_data = get_admin_from_token(token)
            if admin_data and (admin_data.get("is_staff") or admin_data.get("is_superuser")):
                request.admin_user = admin_data
                return view_func(request, *args, **kwargs)

        # 2. Check Django session (if cookies/sessions are used)
        if getattr(request, 'user', None) and request.user.is_authenticated:
            if request.user.is_staff or request.user.is_superuser:
                request.admin_user = {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_staff": request.user.is_staff,
                    "is_superuser": request.user.is_superuser,
                }
                return view_func(request, *args, **kwargs)

        # 3. Fallback: check legacy X-Admin-Password
        admin_pass = str(config("ADMIN_PASSWORD", default="admin123")).strip()
        provided_pass = request.headers.get("X-Admin-Password") or request.headers.get("x-admin-password") or request.META.get("HTTP_X_ADMIN_PASSWORD")
        if provided_pass and str(provided_pass).strip() == admin_pass:
            request.admin_user = {"username": "admin", "is_staff": True, "is_superuser": True}
            return view_func(request, *args, **kwargs)

        return Response({"error": "Unauthorized. Admin privileges required."}, status=401)
    return _wrapped_view
