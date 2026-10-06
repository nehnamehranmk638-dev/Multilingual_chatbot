from sentence_transformers import SentenceTransformer
from groq import Groq
from decouple import config

from .db import (
    messages as messages_collection,
    knowledge_base,
)

from .escalation import log_escalation

import re


# --------------------------------------------------
# Embedding model
# --------------------------------------------------

# IMPORTANT:
# This MUST be the same embedding model that was used
# when the documents were inserted into MongoDB.
#
# Your current ingestion/retrieval setup uses this model.

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# --------------------------------------------------
# Groq client
# --------------------------------------------------

groq_client = Groq(
    api_key=config("GROQ_API_KEY")
)


# --------------------------------------------------
# Conversation history
# --------------------------------------------------

def get_recent_history(session_id, limit=6):

    history = list(
        messages_collection.find(
            {"session_id": session_id}
        )
        .sort("timestamp", -1)
        .limit(limit)
    )

    history.reverse()

    return history


# --------------------------------------------------
# Rewrite follow-up question
# --------------------------------------------------

def rewrite_query_with_context(
    query,
    history
):

    if not history:
        return query

    history_text = "\n".join(
        f"{h['sender']}: {h['content']}"
        for h in history
    )

    prompt = f"""
Given this conversation history and a new user message,
rewrite the new message as a standalone question that
makes sense without the history.

If the message is already standalone, return it unchanged.

Reply with ONLY the rewritten question.

History:
{history_text}

New message:
{query}

Standalone question:
"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
    )

    return (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


# --------------------------------------------------
# Retrieve relevant documents
# --------------------------------------------------

def retrieve_context(
    query,
    top_k=3,
    min_score=0.25
):




    # Convert query into the same embedding space
    # used by the knowledge base.

    query_vector = embedding_model.encode(
        query
    ).tolist()

<<<<<<< HEAD
    docs = []

    try:
        results = knowledge_base.aggregate(
            [
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "embedding",
                        "queryVector": query_vector,
                        "numCandidates": 50,
                        "limit": top_k
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "title": 1,
                        "content": 1,
                        "source": 1,
                        "category": 1,
                        "language": 1,
                        "verified": 1,
                        "score": {
                            "$meta": "vectorSearchScore"
                        }
=======

    results = knowledge_base.aggregate(
        [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": 50,
                    "limit": top_k
                }
            },

            {
                "$project": {
                    "_id": 0,
                    "title": 1,
                    "content": 1,
                    "source": 1,
                    "category": 1,
                    "language": 1,
                    "verified": 1,
                    "score": {
                        "$meta": "vectorSearchScore"
>>>>>>> 085bf62 (admin, feedback)
                    }
                }
            ]
        )
        docs = list(results)
    except Exception as e:
        print(f"Atlas Vector Search unavailable ({e}), using in-memory similarity fallback.")

<<<<<<< HEAD
    # Fallback if Atlas index is not ready or returns 0 results
    if not docs:
        all_docs = list(knowledge_base.find({"verified": True}, {"_id": 0}))
        if all_docs:
            import numpy as np
            q_vec = np.array(query_vector)
            scored = []
            for d in all_docs:
                if "embedding" in d:
                    d_vec = np.array(d["embedding"])
                    sim = float(np.dot(q_vec, d_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(d_vec)))
                    scored.append((sim, d))
            scored.sort(key=lambda x: x[0], reverse=True)
            for sim, d in scored[:top_k]:
                doc_copy = {k: v for k, v in d.items() if k != "embedding"}
                doc_copy["score"] = sim
                docs.append(doc_copy)
=======

    docs = list(results)
>>>>>>> 085bf62 (admin, feedback)


    # --------------------------------------------------
    # Debugging information
    # --------------------------------------------------

    print("\nRetrieved documents:")
    print("====================")

    for i, doc in enumerate(
        docs,
        start=1
    ):

        print(
            f"\nDocument {i}"
        )

        print(
            "Title:",
            doc.get("title")
        )

        print(
            "Score:",
            doc.get("score")
        )

        print(
            "Verified:",
            doc.get("verified")
        )


    # --------------------------------------------------
    # Relevance filtering
    # --------------------------------------------------

    filtered_docs = [
        doc
        for doc in docs
        if doc.get("score", 0) >= min_score
    ]


    print(
        "\nDocuments after relevance filtering:"
    )

    print(
        "====================================="
    )


    for i, doc in enumerate(
        filtered_docs,
        start=1
    ):

        print(
            f"{i}. {doc.get('title')} "
            f"(score={doc.get('score')})"
        )


    return filtered_docs



# --------------------------------------------------
# URL safety check
# --------------------------------------------------

def contains_unverified_url(
    answer,
    context_docs
):

    # URLs appearing in generated answer

    answer_urls = re.findall(
        r'https?://[^\s]+',
        answer
    )


    # URLs appearing in trusted context

    context_text = " ".join(
        doc.get("content", "")
        for doc in context_docs
    )


    context_urls = re.findall(
        r'https?://[^\s]+',
        context_text
    )


    # Normalize trailing punctuation

    answer_urls = {
        url.rstrip(".,;:!?)]}")
        for url in answer_urls
    }


    context_urls = {
        url.rstrip(".,;:!?)]}")
        for url in context_urls
    }


    return any(
        url not in context_urls
        for url in answer_urls
    )


# --------------------------------------------------
# Generate grounded answer
# --------------------------------------------------

def generate_answer(
    query,
    context_docs,
    session_id=None
):

    # --------------------------------------------------
    # No relevant documents
    # --------------------------------------------------

    if not context_docs:

        # Create human escalation record
        if session_id:
            log_escalation(
                query=query,
                session_id=session_id
            )


        return (
            "I couldn't find a verified answer to that "
            "question in the IIIT Kottayam knowledge base.",
            []
        )


    # --------------------------------------------------
    # Only use verified documents
    # --------------------------------------------------

    verified_docs = [
        doc
        for doc in context_docs
        if doc.get("verified") is True
    ]


    # --------------------------------------------------
    # No verified documents
    # --------------------------------------------------

    if not verified_docs:

        # Create human escalation record
        if session_id:
            log_escalation(
                query=query,
                session_id=session_id
            )


        return (
            "I couldn't find a verified answer to that "
            "question in the IIIT Kottayam knowledge base.",
            []
        )


    # --------------------------------------------------
    # Build context
    # --------------------------------------------------

    context_text = "\n\n".join(
        f"[{doc.get('title', 'Untitled')}]\n"
        f"{doc.get('content', '')}"
        for doc in verified_docs
    )


    # --------------------------------------------------
    # Strict grounding prompt
    # --------------------------------------------------

    prompt = f"""
You are an admission assistant for IIIT Kottayam.

Answer the user's question using ONLY the information
provided in the context below.

STRICT RULES:

1. Do NOT use your own knowledge.

2. Do NOT add any fact, step, number, date,
   eligibility criterion, fee, programme detail,
   or other information that is not explicitly
   stated in the context.

3. Do NOT guess or infer missing information.

4. Do NOT invent information to make the answer
   more complete.

5. Do NOT include any URL or link unless that
   exact URL appears in the provided context.

6. If the context does not contain enough information
   to answer the question, clearly say that the
   information is not available in the provided
   IIIT Kottayam knowledge base.

7. If only part of the question can be answered,
   answer only that part and clearly state what
   information is missing.

8. Keep the answer concise and directly related
   to the user's question.

Context:
{context_text}

Question:
{query}

Answer:
"""


    # --------------------------------------------------
    # Generate answer
    # --------------------------------------------------

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        reasoning_effort="low",

        temperature=0.2,
    )


    answer = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )


    # --------------------------------------------------
    # URL hallucination protection
    # --------------------------------------------------

    if contains_unverified_url(
        answer,
        verified_docs
    ):

        print(
            "\nWARNING: Generated answer contained "
            "an unverified URL."
        )


        # Create human escalation record
        if session_id:
            log_escalation(
                query=query,
                session_id=session_id
            )


        return (
            "I couldn't provide a verified answer to "
            "that question because the generated "
            "response contained information that "
            "could not be verified from the "
            "IIIT Kottayam knowledge base.",
            []
        )


    # --------------------------------------------------
    # Sources
    # --------------------------------------------------

    sources = [
        doc.get("source")
        for doc in verified_docs
        if doc.get("source")
    ]


    # --------------------------------------------------
    # Successful response
    # --------------------------------------------------

    return answer, sources