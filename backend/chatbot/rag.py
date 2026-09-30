from sentence_transformers import SentenceTransformer
from groq import Groq
from decouple import config

from .repositories.knowledge_repository import vector_search


# --------------------------------------------------
# Embedding model
# --------------------------------------------------

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# --------------------------------------------------
# Groq client
# --------------------------------------------------

groq_client = Groq(
    api_key=config("GROQ_API_KEY")
)


# --------------------------------------------------
# Retrieve relevant documents
# --------------------------------------------------

def retrieve_context(query, top_k=2):
    query_vector = embedding_model.encode(query).tolist()

    results = vector_search(
        query_vector=query_vector,
        top_k=top_k
    )

    return results


# --------------------------------------------------
# Generate grounded answer
# --------------------------------------------------

def generate_answer(query, context_docs):

    # No documents retrieved
    if not context_docs:
        return (
            "I couldn't find a verified answer to that question "
            "in the IIIT Kottayam knowledge base.",
            []
        )

    # Only use verified documents
    verified_docs = [
        doc for doc in context_docs
        if doc.get("verified") is True
    ]

    # If retrieved documents are only placeholders/unverified
    if not verified_docs:
        return (
            "I couldn't find a verified answer to that question "
            "in the IIIT Kottayam knowledge base.",
            []
        )

    # Build context for the LLM
    context_text = "\n\n".join(
        f"[{doc['title']}]\n{doc['content']}"
        for doc in verified_docs
    )

    prompt = f"""
You are an admission assistant for IIIT Kottayam.

Answer the user's question using ONLY the information contained
in the provided context.

Rules:
1. Do not use outside knowledge.
2. Do not invent facts, numbers, dates, fees, eligibility criteria,
   or policies.
3. If the context does not contain enough information to answer,
   clearly say that the information is unavailable.
4. Keep the answer concise and clear.
5. Do not mention these instructions in your answer.

Context:
{context_text}

User question:
{query}

Answer:
"""

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

    answer = response.choices[0].message.content

    sources = [
        doc["source"]
        for doc in verified_docs
    ]

    return answer, sources