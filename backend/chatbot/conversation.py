from .db import messages


def get_conversation_history(session_id, limit=6):
    """
    Get the most recent messages for a conversation.
    """

    docs = list(
        messages.find(
            {"session_id": session_id},
            {
                "_id": 0,
                "sender": 1,
                "content": 1,
            }
        )
        .sort("timestamp", -1)
        .limit(limit)
    )

    # MongoDB gives newest first.
    # Reverse so the conversation is chronological.
    docs.reverse()

    return docs


def format_conversation_history(history):
    """
    Convert MongoDB messages into text that can be
    passed to the LLM.
    """

    if not history:
        return "No previous conversation."

    lines = []

    for message in history:
        sender = message.get("sender", "unknown")
        content = message.get("content", "")

        if sender == "user":
            lines.append(f"User: {content}")
        else:
            lines.append(f"Assistant: {content}")

    return "\n".join(lines)