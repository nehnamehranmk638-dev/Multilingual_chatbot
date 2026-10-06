from datetime import datetime

from .db import db


# --------------------------------------------------
# Escalations collection
# --------------------------------------------------

escalations = db["escalations"]


# --------------------------------------------------
# Log human escalation
# --------------------------------------------------

def log_escalation(query, session_id):
    """
    Create a trackable escalation record when the
    chatbot cannot provide a verified answer.
    """

    escalation = {
        "session_id": session_id,
        "query": query,
        "status": "pending",
        "assigned_staff": None,
        "timestamp": datetime.utcnow(),
    }

    result = escalations.insert_one(escalation)

    print(
        f"\nEscalation created: {result.inserted_id}"
    )

    return str(result.inserted_id)