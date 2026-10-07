from rest_framework.decorators import api_view
from rest_framework.response import Response
from bson import ObjectId
from datetime import datetime

from .db import db, knowledge_base, feedback
from .admin_auth import require_admin
from .rag import embedding_model

escalations = db["escalations"]

@api_view(['GET'])
@require_admin
def get_kb_docs(request):
    docs = list(knowledge_base.find({}, {"embedding": 0}))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return Response(docs)

@api_view(['POST'])
@require_admin
def create_kb_doc(request):
    data = request.data
    title = data.get("title")
    content = data.get("content")
    category = data.get("category", "")
    language = data.get("language", "en")
    source = data.get("source", "")
    verified = data.get("verified", False)

    if not title or not content:
        return Response({"error": "Title and content are required"}, status=400)

    # Generate embedding
    embedding = embedding_model.encode(content).tolist()

    doc = {
        "title": title,
        "content": content,
        "category": category,
        "language": language,
        "source": source,
        "verified": verified,
        "embedding": embedding
    }

    result = knowledge_base.insert_one(doc)
    
    return Response({"success": True, "id": str(result.inserted_id)})

@api_view(['PUT'])
@require_admin
def update_kb_doc(request, doc_id):
    try:
        obj_id = ObjectId(doc_id)
    except:
        return Response({"error": "Invalid document ID"}, status=400)

    existing_doc = knowledge_base.find_one({"_id": obj_id})
    if not existing_doc:
        return Response({"error": "Document not found"}, status=404)

    data = request.data
    update_fields = {}
    
    if "title" in data: update_fields["title"] = data["title"]
    if "category" in data: update_fields["category"] = data["category"]
    if "language" in data: update_fields["language"] = data["language"]
    if "source" in data: update_fields["source"] = data["source"]
    if "verified" in data: update_fields["verified"] = data["verified"]
    
    if "content" in data and data["content"] != existing_doc.get("content"):
        update_fields["content"] = data["content"]
        update_fields["embedding"] = embedding_model.encode(data["content"]).tolist()

    if update_fields:
        knowledge_base.update_one({"_id": obj_id}, {"$set": update_fields})

    return Response({"success": True})

@api_view(['DELETE'])
@require_admin
def delete_kb_doc(request, doc_id):
    try:
        obj_id = ObjectId(doc_id)
    except:
        return Response({"error": "Invalid document ID"}, status=400)
        
    result = knowledge_base.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return Response({"error": "Document not found"}, status=404)
        
    return Response({"success": True})

@api_view(['GET'])
@require_admin
def get_escalations(request):
    docs = list(escalations.find({}).sort("timestamp", -1))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return Response(docs)

@api_view(['POST'])
@require_admin
def resolve_escalation(request, esc_id):
    try:
        obj_id = ObjectId(esc_id)
    except:
        return Response({"error": "Invalid escalation ID"}, status=400)
        
    response_text = request.data.get("response", "")
    
    result = escalations.update_one(
        {"_id": obj_id},
        {"$set": {"status": "resolved", "response": response_text}}
    )
    
    if result.matched_count == 0:
        return Response({"error": "Escalation not found"}, status=404)
        
    return Response({"success": True})

@api_view(['GET'])
@require_admin
def get_feedback(request):
    docs = list(feedback.find({}).sort("timestamp", -1))
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        if "message_id" in doc and isinstance(doc["message_id"], ObjectId):
            doc["message_id"] = str(doc["message_id"])
    return Response(docs)


# Language code → display name mapping (mirrors the project's existing language support)
LANG_DISPLAY_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ml": "Malayalam",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
}


@api_view(['GET'])
@require_admin
def analytics_summary(request):
    """
    Aggregate analytics from existing MongoDB collections.
    Uses only data already stored; no new collections created.
    """
    try:
        from .db import messages as messages_col

        # --------------------------------------------------------
        # 1. Total user queries
        # --------------------------------------------------------
        total_queries = messages_col.count_documents({"sender": "user"})

        # --------------------------------------------------------
        # 2. Unique sessions/conversations (session_id already stored)
        # --------------------------------------------------------
        unique_sessions = len(messages_col.distinct("session_id", {"sender": "user"}))

        # --------------------------------------------------------
        # 3. Queries by language (aggregation on existing field)
        # --------------------------------------------------------
        lang_pipeline = [
            {"$match": {"sender": "user"}},
            {"$group": {"_id": "$language", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        lang_raw = list(messages_col.aggregate(lang_pipeline))

        queries_by_language = []
        for item in lang_raw:
            code = item["_id"] or "unknown"
            display = LANG_DISPLAY_NAMES.get(code, code.upper() if code != "unknown" else "Unknown")
            queries_by_language.append({"language": display, "count": item["count"]})

        # --------------------------------------------------------
        # 4. Feedback stats (response-level only: helpful / not_helpful)
        # --------------------------------------------------------
        helpful_count = feedback.count_documents({"feedback_type": "response", "rating": "helpful"})
        not_helpful_count = feedback.count_documents({"feedback_type": "response", "rating": "not_helpful"})
        total_response_feedback = helpful_count + not_helpful_count
        helpful_pct = round((helpful_count / total_response_feedback) * 100, 1) if total_response_feedback > 0 else 0.0

        feedback_stats = {
            "helpful": helpful_count,
            "not_helpful": not_helpful_count,
            "helpful_percentage": helpful_pct,
        }

        # --------------------------------------------------------
        # 5. Escalation stats
        # --------------------------------------------------------
        total_escalations = escalations.count_documents({})
        pending_escalations = escalations.count_documents({"status": "pending"})

        escalation_stats = {
            "total": total_escalations,
            "pending": pending_escalations,
        }

        # --------------------------------------------------------
        # Return combined analytics
        # --------------------------------------------------------
        return Response({
            "total_queries": total_queries,
            "unique_sessions": unique_sessions,
            "queries_by_language": queries_by_language,
            "feedback": feedback_stats,
            "escalations": escalation_stats,
        })

    except Exception as e:
        return Response({"error": "Failed to load analytics", "details": str(e)}, status=500)


# ============================================================
# ADMIN AUTHENTICATION ENDPOINTS
# ============================================================

from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from .admin_auth import create_admin_token, delete_admin_token, _extract_bearer_token


@api_view(['POST'])
def admin_login(request):
    """
    Authenticate admin credentials against Django's built-in User system.
    Supports either username or email.
    Explicitly rejects Student/Parent accounts and non-staff/non-superuser accounts.
    """
    username_or_email = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username_or_email or not password:
        return Response({"error": "Please enter both username/email and password."}, status=400)

    # 1. Attempt authentication with username directly
    user = authenticate(request, username=username_or_email, password=password)

    # 2. If not matched and looks like email, lookup username from email
    if not user and "@" in username_or_email:
        try:
            matched_user = User.objects.filter(email__iexact=username_or_email).first()
            if matched_user:
                user = authenticate(request, username=matched_user.username, password=password)
        except Exception:
            pass

    # 3. If authentication failed, check if this is a Student/Parent account in MongoDB
    if not user:
        from .db import db
        student_or_parent = db["users"].find_one({"email": username_or_email.lower()})
        if student_or_parent:
            return Response(
                {"error": "Access denied. Student and Parent accounts cannot log in to the Admin Portal."},
                status=403
            )
        return Response({"error": "Invalid username or password."}, status=401)

    # 4. Check staff / superuser permissions
    if not (user.is_staff or user.is_superuser):
        return Response(
            {"error": "Access denied. You do not have administrator permissions."},
            status=403
        )

    # 5. Log in Django session if session framework is available
    try:
        django_login(request, user)
    except Exception:
        pass

    # 6. Generate secure admin token
    token = create_admin_token(user)

    return Response({
        "message": "Admin authentication successful",
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
    })


@api_view(['POST'])
def admin_logout(request):
    """
    Invalidate admin token and session on logout.
    """
    token = _extract_bearer_token(request)
    if token:
        delete_admin_token(token)
    try:
        django_logout(request)
    except Exception:
        pass
    return Response({"message": "Logged out successfully."})


@api_view(['GET'])
@require_admin
def admin_me(request):
    """
    Verify current admin authentication state.
    """
    return Response({
        "authenticated": True,
        "user": getattr(request, 'admin_user', {})
    })

