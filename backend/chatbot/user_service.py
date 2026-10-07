import hashlib
import secrets
from datetime import datetime, timezone
from .db import db

users = db["users"]

# ----------------------------------------------------------
# Collection
# ----------------------------------------------------------
def _ensure_index():
    try:
        users.create_index("email", unique=True)
    except Exception:
        pass


def hash_password(password: str) -> str:
    """SHA-256 + per-user salt stored together as 'salt:hash'."""
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(password: str, stored: str) -> bool:
    """Verify a plaintext password against a stored 'salt:hash'."""
    try:
        salt, h = stored.split(":", 1)
        return hashlib.sha256((salt + password).encode()).hexdigest() == h
    except Exception:
        return False


def create_user(name: str, email: str, password: str, role: str) -> dict:
    """
    Insert a new user document.
    Returns the inserted document (without password_hash).
    Raises ValueError on duplicate email.
    """
    if role not in ("student", "parent"):
        raise ValueError("Invalid role")

    clean_email = email.strip().lower()
    if users.find_one({"email": clean_email}):
        raise ValueError("Email already registered")

    doc = {
        "name": name.strip(),
        "email": clean_email,
        "password_hash": hash_password(password),
        "role": role,
        "created_at": datetime.now(timezone.utc),
    }

    try:
        result = users.insert_one(doc)
        return {"_id": str(result.inserted_id), "name": doc["name"],
                "email": doc["email"], "role": doc["role"]}
    except Exception as e:
        if "duplicate key" in str(e).lower() or "E11000" in str(e):
            raise ValueError("Email already registered")
        raise


def authenticate_user(email: str, password: str) -> dict | None:
    """
    Returns safe user dict if credentials are valid, else None.
    Never reveals the password_hash to callers.
    """
    user = users.find_one({"email": email.strip().lower()})
    if not user:
        return None
    if not verify_password(password, user.get("password_hash", "")):
        return None
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


def get_user_by_id(user_id: str) -> dict | None:
    """Fetch a user by string ID. Returns safe dict or None."""
    from bson import ObjectId
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None
    if not user:
        return None
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }
