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
