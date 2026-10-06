import re
from datetime import datetime, timezone

from .db import db


feedback_collection = db["feedback"]


# Reasons that should automatically go for admin review
ADMIN_REVIEW_REASONS = {
    "incorrect_information",
    "outdated_information",
    "incomplete_answer",
}


VALID_NOT_HELPFUL_REASONS = {
    "incorrect_information",
    "incomplete_answer",
    "outdated_information",
    "answer_unclear",
    "didnt_understand_question",
    "wrong_translation",
    "other",
}


EMAIL_RE = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


def sanitize_text(value, max_len=1000):
    """
    Convert user input to safe, trimmed text
    and prevent excessively large submissions.
    """
    if value is None:
        return ""

    return str(value).strip()[:max_len]


def validate_email(email):
    """
    Email is optional.
    If provided, validate its format.
    """
    if not email:
        return True

    return bool(EMAIL_RE.match(email))


def build_response_feedback(data):
    """
    Validate and construct feedback for
    a particular chatbot response.
    """

    rating = data.get("rating")

    if rating not in ("helpful", "not_helpful"):
        return None, "rating must be 'helpful' or 'not_helpful'"

    message_id = sanitize_text(data.get("message_id"), 100)
    session_id = sanitize_text(data.get("session_id"), 100)

    if not message_id:
        return None, "message_id is required"

    if not session_id:
        return None, "session_id is required"

    reason = sanitize_text(
        data.get("reason", ""),
        100
    )

    comment = sanitize_text(
        data.get("comment", ""),
        1000
    )

    language = sanitize_text(
        data.get("language", "en"),
        20
    )

    user_mode = sanitize_text(
        data.get("user_mode", ""),
        20
    )

    # Reason is only relevant for negative feedback
    if rating == "not_helpful":

        if reason and reason not in VALID_NOT_HELPFUL_REASONS:
            return None, "Invalid feedback reason"

    else:
        reason = ""

    # Determine whether admin review is required
    if reason in ADMIN_REVIEW_REASONS:

        status = "pending_review"
        priority = "high" if reason in {
            "incorrect_information",
            "outdated_information"
        } else "medium"

    else:

        status = "recorded"
        priority = "normal"

    document = {
        "feedback_type": "response",

        "message_id": message_id,
        "session_id": session_id,

        "rating": rating,
        "reason": reason,
        "comment": comment,

        "language": language,
        "user_mode": user_mode,

        "status": status,
        "priority": priority,

        "timestamp": datetime.now(timezone.utc),
    }

    return document, None


def build_general_feedback(data):
    """
    Validate and construct general application feedback.
    """

    session_id = sanitize_text(
        data.get("session_id"),
        100
    )

    if not session_id:
        return None, "session_id is required"

    rating = data.get("rating")

    # Rating is optional, but if provided it must be 1-5
    if rating is not None:

        try:
            rating = int(rating)

        except (TypeError, ValueError):
            return None, "rating must be an integer from 1 to 5"

        if rating < 1 or rating > 5:
            return None, "rating must be between 1 and 5"

    comment = sanitize_text(
        data.get("comment", ""),
        2000
    )

    name = sanitize_text(
        data.get("name", ""),
        100
    )

    email = sanitize_text(
        data.get("email", ""),
        200
    )

    if not validate_email(email):
        return None, "Please enter a valid email address"

    language = sanitize_text(
        data.get("language", "en"),
        20
    )

    user_mode = sanitize_text(
        data.get("user_mode", ""),
        20
    )

    # General feedback is normally recorded.
    # It can be reviewed later from an admin dashboard.
    status = "recorded"

    priority = "normal"

    document = {
        "feedback_type": "general",

        "session_id": session_id,

        "rating": rating,
        "comment": comment,

        "name": name,
        "email": email,

        "language": language,
        "user_mode": user_mode,

        "status": status,
        "priority": priority,

        "timestamp": datetime.now(timezone.utc),
    }

    return document, None


def store_feedback(document):

    result = feedback_collection.insert_one(document)

    return str(result.inserted_id)