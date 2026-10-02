from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime

from .db import messages
from .agent import process_multilingual_query
from .speech import transcribe_audio


@api_view(['POST'])
def chat(request):

    user_message = request.data.get('message', '')
    session_id = request.data.get(
        'session_id',
        'demo-session'
    )

    if not user_message.strip():
        return Response(
            {"error": "Message cannot be empty"},
            status=400
        )

    # ---------------------------------------------
    # Get previous conversation
    # ---------------------------------------------

    conversation_history = list(
        messages.find(
            {
                "session_id": session_id
            },
            {
                "_id": 0,
                "sender": 1,
                "content": 1
            }
        ).sort("timestamp", 1)
    )

    # ---------------------------------------------
    # Multilingual processing
    # ---------------------------------------------

    result = process_multilingual_query(
        user_message,
        conversation_history
    )

    # ---------------------------------------------
    # Save user message
    # ---------------------------------------------

    messages.insert_one({
        "session_id": session_id,
        "sender": "user",
        "content": user_message,
        "timestamp": datetime.utcnow(),
        "language": result["language"]
    })

    # ---------------------------------------------
    # Save bot response
    # ---------------------------------------------

    messages.insert_one({
        "session_id": session_id,
        "sender": "bot",
        "content": result["answer"],
        "sources": result["sources"],
        "type": result["type"],
        "language": result["language"],
        "timestamp": datetime.utcnow()
    })

    # ---------------------------------------------
    # Return response
    # ---------------------------------------------

    return Response({
        "answer": result["answer"],
        "sources": result["sources"],
        "type": result["type"],
        "language": result["language"],
        "language_name": result["language_name"],
        "translated_query": result["translated_query"]
    })


@api_view(['POST'])
def speech_to_text(request):

    if 'audio' not in request.FILES:
        return Response(
            {"error": "No audio file provided"},
            status=400
        )

    audio_file = request.FILES['audio']

    try:
        text = transcribe_audio(audio_file)

        return Response({
            "text": text
        })

    except Exception as e:

        return Response(
            {
                "error": "Speech transcription failed",
                "details": str(e)
            },
            status=500
        )