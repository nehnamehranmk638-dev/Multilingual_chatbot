"""
Authentication API views for normal users (student / parent).

Endpoints:
    POST /api/auth/signup/
    POST /api/auth/login/
    POST /api/auth/logout/
    GET  /api/auth/me/

These are completely separate from the admin password system.
"""

import re
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .user_service import create_user, authenticate_user
from .auth_service import create_token, delete_token, get_user_from_token, _extract_token, require_auth


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ----------------------------------------------------------
# SIGNUP
# ----------------------------------------------------------

@api_view(["POST"])
def signup(request):
    data = request.data

    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")
    confirm  = (data.get("confirm_password") or "")
    role     = (data.get("role") or "").strip().lower()

    # ---- Validate ----
    if not name:
        return Response({"error": "Full name is required"}, status=400)
    if not email or not EMAIL_RE.match(email):
        return Response({"error": "A valid email is required"}, status=400)
    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)
    if password != confirm:
        return Response({"error": "Passwords do not match"}, status=400)
    if role not in ("student", "parent"):
        return Response({"error": "Role must be 'student' or 'parent'"}, status=400)

    # ---- Create user ----
    try:
        user = create_user(name, email, password, role)
    except ValueError as e:
        return Response({"error": str(e)}, status=409)
    except Exception:
        return Response({"error": "Could not create account. Please try again."}, status=500)

    # ---- Auto-login: issue token ----
    token = create_token(user["_id"])

    return Response({
        "message": "Account created successfully",
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    }, status=201)


# ----------------------------------------------------------
# LOGIN
# ----------------------------------------------------------

@api_view(["POST"])
def login(request):
    data = request.data

    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=400)

    user = authenticate_user(email, password)
    if not user:
        # Generic message — do not reveal whether email exists
        return Response({"error": "Invalid email or password"}, status=401)

    token = create_token(user["user_id"])

    return Response({
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    })


# ----------------------------------------------------------
# LOGOUT
# ----------------------------------------------------------

@api_view(["POST"])
def logout(request):
    token = _extract_token(request)
    if token:
        delete_token(token)
    return Response({"message": "Logged out successfully"})


# ----------------------------------------------------------
# ME  (current user info)
# ----------------------------------------------------------

@api_view(["GET"])
def me(request):
    token = _extract_token(request)
    user = get_user_from_token(token)
    if not user:
        return Response({"authenticated": False}, status=401)
    return Response({
        "authenticated": True,
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    })
