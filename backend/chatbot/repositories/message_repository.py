from chatbot.db import messages


def save_message(session_id, sender, content):
    messages.insert_one({
        "session_id": session_id,
        "sender": sender,
        "content": content,
    })