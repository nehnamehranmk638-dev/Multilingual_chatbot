from chatbot.conversation import (
    get_conversation_history,
    format_conversation_history
)

session_id = "demo-session"

history = get_conversation_history(session_id)

print("\n===== CONVERSATION HISTORY =====\n")

print(format_conversation_history(history))