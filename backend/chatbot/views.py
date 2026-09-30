from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime

from .db import messages
from .conversation import get_conversation_history
from .agent import run_agent


@api_view(['POST'])
def chat(request):

    user_message = request.data.get('message', '').strip()

    session_id = request.data.get(
        'session_id',
        'demo-session'
    )

    if not user_message:
        return Response(
            {"error": "Message cannot be empty"},
            status=400
        )

    # -----------------------------------
    # 1. Get previous conversation
    # -----------------------------------

    history = get_conversation_history(
        session_id,
        limit=6
    )

    # -----------------------------------
    # 2. Send query + history to agent
    # -----------------------------------

    result = run_agent(
        user_message,
        history
    )

    # -----------------------------------
    # 3. Save user message
    # -----------------------------------

    messages.insert_one({
        "session_id": session_id,
        "sender": "user",
        "content": user_message,
        "timestamp": datetime.utcnow(),
    })

    # -----------------------------------
    # 4. Save bot message
    # -----------------------------------

    messages.insert_one({
        "session_id": session_id,
        "sender": "bot",
        "content": result["answer"],
        "sources": result.get("sources", []),
        "type": result.get("type", "general"),
        "timestamp": datetime.utcnow(),
    })

    # -----------------------------------
    # 5. Return response
    # -----------------------------------

    return Response({
        "answer": result["answer"],
        "sources": result.get("sources", []),
        "type": result.get("type", "general")
    })