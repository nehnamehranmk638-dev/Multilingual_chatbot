from rest_framework.decorators import api_view
from rest_framework.response import Response

from .repositories.message_repository import save_message
from .rag import retrieve_context, generate_answer


@api_view(["POST"])
def chat(request):

    user_message = request.data.get("message", "")
    session_id = request.data.get(
        "session_id",
        "demo-session"
    )

    # Retrieve relevant knowledge
    context_docs = retrieve_context(
        user_message,
        top_k=2
    )

    # Generate grounded answer
    reply, sources = generate_answer(
        user_message,
        context_docs
    )

    # Save user message
    save_message(
        session_id=session_id,
        sender="user",
        content=user_message
    )

    # Save bot response
    save_message(
        session_id=session_id,
        sender="bot",
        content=reply
    )

    return Response({
        "answer": reply,
        "sources": sources
    })