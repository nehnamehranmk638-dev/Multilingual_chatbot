from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime

from .db import messages, feedback
from .agent import process_multilingual_query
from .speech import transcribe_audio, synthesize_speech, GTTS_LANG_MAP

from .feedback_service import (
    build_response_feedback,
    build_general_feedback,
    store_feedback,
)
from .admin_auth import require_admin
from .auth_service import require_auth


# ============================================================
# CHAT
# ============================================================

@api_view(['POST'])
@require_auth
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
    # Save user message & bot response
    # --------------------------------------------------------

    user_info = getattr(request, 'user_data', {}) or {}
    user_id = user_info.get("user_id") or request.data.get("user_id")
    user_role = user_info.get("role")

    messages.insert_one({
        "session_id": session_id,
        "sender": "user",
        "content": user_message,
        "language": result["language"],
        "user_id": user_id,
        "user_role": user_role,
        "timestamp": datetime.utcnow()
    })

    bot_insert_result = messages.insert_one({
        "session_id": session_id,
        "sender": "bot",
        "content": result["answer"],
        "sources": result["sources"],
        "type": result["type"],
        "language": result["language"],
        "user_id": user_id,
        "user_role": user_role,
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

        "detected_code": result["language"],

        "language_name": result["language_name"],

        "translated_query": result["translated_query"],

        # IMPORTANT for response-level feedback
        "message_id": str(
            bot_insert_result.inserted_id
        )
    })


# ============================================================
# SESSIONS & CHAT HISTORY
# ============================================================

def _get_request_user_id(request):
    """
    Extract user_id from Bearer token in Authorization header,
    authenticated user data, X-User-ID header, or user_id query parameter.
    """
    # 1. First priority: Check if request has Bearer token in Authorization header
    from .auth_service import _extract_token, get_user_from_token
    token = _extract_token(request)
    if token:
        user = get_user_from_token(token)
        if user and user.get("user_id"):
            return user.get("user_id")

    # 2. Check user_data attached by decorator
    user_info = getattr(request, 'user_data', {}) or {}
    if user_info.get("user_id"):
        return user_info.get("user_id")

    # 3. Fallback to X-User-ID or user_id query param
    return request.headers.get("X-User-ID") or request.GET.get("user_id")


@api_view(['GET'])
def list_sessions(request):
    """
    Returns distinct chat sessions for the requesting user.
    Each session contains:
    - session_id
    - title (first user message truncated to 50 chars)
    - last_updated (ISO 8601 timestamp of newest message)
    - message_count
    """
    user_id = _get_request_user_id(request)

    match_stage = {}
    if user_id:
        match_stage["user_id"] = user_id

    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})

    # Group by session_id, sort messages by timestamp
    pipeline.extend([
        {"$sort": {"timestamp": 1}},
        {
            "$group": {
                "_id": "$session_id",
                "message_count": {"$sum": 1},
                "last_updated": {"$last": "$timestamp"},
                "messages": {
                    "$push": {
                        "sender": "$sender",
                        "content": "$content"
                    }
                }
            }
        },
        {"$sort": {"last_updated": -1}}
    ])

    results = list(messages.aggregate(pipeline))

    sessions_data = []
    for doc in results:
        sess_id = doc.get("_id")
        if not sess_id:
            continue

        # Find the first user message for title
        title = "New conversation"
        doc_msgs = doc.get("messages", [])
        for m in doc_msgs:
            if m.get("sender") == "user" and m.get("content"):
                c = m.get("content", "").strip()
                title = (c[:47] + "...") if len(c) > 50 else c
                break

        last_updated = doc.get("last_updated")
        last_updated_str = ""
        if isinstance(last_updated, datetime):
            last_updated_str = last_updated.isoformat() + "Z"
        elif last_updated:
            last_updated_str = str(last_updated)

        sessions_data.append({
            "session_id": sess_id,
            "title": title,
            "last_updated": last_updated_str,
            "message_count": doc.get("message_count", 0),
        })

    return Response({"sessions": sessions_data})


@api_view(['GET', 'DELETE'])
def session_detail(request, session_id):
    """
    GET: Returns full message history for a specific session_id.
    DELETE: Deletes all messages in the messages collection for the specified session_id.
    """
    user_id = _get_request_user_id(request)

    if request.method == 'GET':
        query = {"session_id": session_id}
        if user_id:
            query["user_id"] = user_id

        docs = list(messages.find(query).sort("timestamp", 1))

        if not docs and user_id:
            docs = list(messages.find({"session_id": session_id}).sort("timestamp", 1))

        formatted_messages = []
        for d in docs:
            ts = d.get("timestamp")
            ts_str = ""
            if isinstance(ts, datetime):
                ts_str = ts.isoformat() + "Z"
            elif ts:
                ts_str = str(ts)

            msg_obj = {
                "sender": d.get("sender", "user"),
                "content": d.get("content", ""),
                "language": d.get("language", "en"),
                "timestamp": ts_str,
            }

            if d.get("sender") == "bot":
                msg_obj["sources"] = d.get("sources", [])
                msg_obj["type"] = d.get("type", "general")
                msg_obj["message_id"] = str(d.get("_id", ""))

            formatted_messages.append(msg_obj)

        return Response({
            "session_id": session_id,
            "messages": formatted_messages
        })

    elif request.method == 'DELETE':
        query = {"session_id": session_id}
        if user_id:
            query["user_id"] = user_id

        existing_count = messages.count_documents(query)

        if existing_count == 0 and user_id:
            query = {"session_id": session_id}
            existing_count = messages.count_documents(query)

        if existing_count == 0:
            return Response(
                {"error": "Session not found", "session_id": session_id},
                status=404
            )

        delete_result = messages.delete_many(query)

        return Response({
            "success": True,
            "message": f"Deleted session {session_id}",
            "deleted_count": delete_result.deleted_count
        })


@api_view(['GET'])
@require_admin
def list_kb_documents(request):
    docs = list(knowledge_base.find({}, {"embedding": 0}))
    for d in docs:
        d['_id'] = str(d['_id'])
    return Response(docs)   # <-- plain array, not wrapped in {"documents": ...}


# ============================================================
# SPEECH TO TEXT
# ============================================================

@api_view(['POST'])
@require_auth
def speech_to_text(request):

    if 'audio' not in request.FILES:

        return Response(
            {
                "error": "No audio file provided"
            },
            status=400
        )

    audio_file = request.FILES['audio']
    language = request.data.get('language') or request.POST.get('language')

    try:

        text = transcribe_audio(
            audio_file,
            language=language
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
# TEXT TO SPEECH (SYNTHESIZE)
# ============================================================

@api_view(['POST'])
def synthesize(request):
    """
    Synthesize text into speech MP3 using gTTS.
    Accepts:
    - text: text to synthesize
    - lang or language: ISO language code (e.g. 'ml', 'hi', 'en')
    Returns audio/mpeg binary stream.
    """
    text = request.data.get('text', '').strip()

    if not text:
        return Response(
            {"error": "Text is required for speech synthesis"},
            status=400
        )

    # Check both 'lang' and 'language' keys to eliminate any parameter naming mismatch
    lang_code = request.data.get('lang') or request.data.get('language') or 'en'

    try:
        audio_bytes = synthesize_speech(
            text,
            lang=lang_code
        )

        return HttpResponse(
            audio_bytes,
            content_type="audio/mpeg"
        )

    except Exception as e:
        return Response(
            {
                "error": "Speech synthesis failed",
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