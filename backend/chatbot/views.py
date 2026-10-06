from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime

from .db import messages, feedback
from .agent import process_multilingual_query
from .speech import transcribe_audio

from .feedback_service import (
    build_response_feedback,
    build_general_feedback,
    store_feedback,
)
from .admin_auth import require_admin


# ============================================================
# CHAT
# ============================================================

@api_view(['POST'])
def chat(request):

    user_message = request.data.get(
        'message',
        ''
    )

    session_id = request.data.get(
        'session_id',
        'demo-session'
    )


    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    if not user_message.strip():

        return Response(
            {
                "error": "Message cannot be empty"
            },
            status=400
        )


    # --------------------------------------------------------
    # Get previous conversation
    # --------------------------------------------------------

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
        ).sort(
            "timestamp",
            1
        )
    )


    # --------------------------------------------------------
    # Multilingual processing
    # --------------------------------------------------------
    #
    # IMPORTANT:
    # session_id is passed through the complete agent
    # pipeline so human escalations can be associated
    # with the correct chat session.
    # --------------------------------------------------------

    result = process_multilingual_query(
        user_message,
        conversation_history,
        session_id
    )


    # --------------------------------------------------------
    # Save bot response
    #
    # Capture MongoDB inserted ID so the frontend can
    # associate 👍 / 👎 feedback with this exact response.
    # --------------------------------------------------------

    bot_insert_result = messages.insert_one({

        "session_id": session_id,

        "sender": "bot",

        "content": result["answer"],

        "sources": result["sources"],

        "type": result["type"],

        "language": result["language"],

        "timestamp": datetime.utcnow()
    })


    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return Response({

        "answer": result["answer"],

        "sources": result["sources"],

        "type": result["type"],

        "language": result["language"],

        "language_name": result["language_name"],

        "translated_query": result["translated_query"],

        # IMPORTANT for response-level feedback
        "message_id": str(
            bot_insert_result.inserted_id
        )
    })


# ============================================================
# SPEECH TO TEXT
# ============================================================

@api_view(['POST'])
def speech_to_text(request):

    if 'audio' not in request.FILES:

        return Response(
            {
                "error": "No audio file provided"
            },
            status=400
        )


    audio_file = request.FILES['audio']


    try:

        text = transcribe_audio(
            audio_file
        )


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


# ============================================================
# FEEDBACK
# ============================================================

@api_view(["POST"])
def submit_feedback(request):

    data = request.data

    feedback_type = data.get(
        "feedback_type"
    )


    # --------------------------------------------------------
    # Response feedback
    # --------------------------------------------------------

    if feedback_type == "response":

        document, error = build_response_feedback(
            data
        )


    # --------------------------------------------------------
    # General application feedback
    # --------------------------------------------------------

    elif feedback_type == "general":

        document, error = build_general_feedback(
            data
        )


    # --------------------------------------------------------
    # Invalid feedback type
    # --------------------------------------------------------

    else:

        return Response(
            {
                "error": (
                    "feedback_type must be "
                    "'response' or 'general'"
                )
            },
            status=400,
        )


    # --------------------------------------------------------
    # Validation error
    # --------------------------------------------------------

    if error:

        return Response(
            {
                "error": error
            },
            status=400,
        )


    # --------------------------------------------------------
    # Store feedback
    # --------------------------------------------------------

    try:

        feedback_id = store_feedback(
            document
        )


        return Response(
            {
                "status": "success",

                "feedback_id": feedback_id,
            },
            status=201,
        )


    except Exception as e:

        print(
            "Feedback storage error:",
            e
        )


        return Response(
            {
                "error": "Could not store feedback"
            },
            status=500,
        )

@api_view(['GET'])
@require_admin
def list_kb_documents(request):
    docs = list(knowledge_base.find({}, {"embedding": 0}))
    for d in docs:
        d['_id'] = str(d['_id'])
    return Response(docs)   # <-- plain array, not wrapped in {"documents": ...}