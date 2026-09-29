from rest_framework.decorators import api_view
from rest_framework.response import Response

from .repositories.message_repository import save_message


@api_view(["POST"])
def chat(request):
    user_message = request.data.get("message", "")
    session_id = request.data.get("session_id", "demo-session")

    # M2: still an echo response.
    # Real RAG/LLM will come in M3.
    reply = f"You said: {user_message}"

    # Save user's message
    save_message(
        session_id=session_id,
        sender="user",
        content=user_message,
    )

    # Save chatbot's response
    save_message(
        session_id=session_id,
        sender="bot",
        content=reply,
    )

    return Response({
        "answer": reply
    })