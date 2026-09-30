import re

from groq import Groq
from decouple import config

from .rag import (
    retrieve_context,
    generate_answer,
)

from .eligibility import check_eligibility


# --------------------------------------------------
# Groq client
# --------------------------------------------------

client = Groq(
    api_key=config("GROQ_API_KEY")
)

def rewrite_query(query, conversation_history):
    """
    Convert a follow-up question into a standalone question
    using previous conversation context.
    """

    if not conversation_history:
        return query

    history_text = "\n".join(
        f"{msg['sender'].capitalize()}: {msg['content']}"
        for msg in conversation_history
    )

    prompt = f"""
You are a query-rewriting assistant for an IIIT Kottayam
admission chatbot.

Your job is to convert the user's latest question into a
standalone question using the conversation history.

Conversation history:
{history_text}

Latest user question:
{query}

Rules:
1. If the latest question is already standalone, return it unchanged.
2. If it is a follow-up, include the missing context from the conversation.
3. Do not answer the question.
4. Do not add facts that are not present in the conversation.
5. Return ONLY the rewritten question.

Standalone question:
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()


# --------------------------------------------------
# 1. CLASSIFY USER INTENT
# --------------------------------------------------

def classify_intent(query):

    prompt = f"""Classify this IIIT Kottayam admission chatbot question
into exactly ONE category.

Reply with ONLY the category word.

Categories:

- eligibility_check:
  The user gives a JEE rank and/or category and asks
  whether they can get admission or which branch they may get.

- general:
  Any other admission question such as fees, dates,
  hostel, documents, general eligibility, programmes,
  contact information, etc.

Question:
{query}

Category:"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0,
    )

    intent = response.choices[0].message.content.strip().lower()

    # Safety: only allow our known categories
    if intent not in ["general", "eligibility_check"]:
        intent = "general"

    return intent


# --------------------------------------------------
# 2. EXTRACT RANK AND CATEGORY
# --------------------------------------------------

def extract_rank_and_category(query):

    query_lower = query.lower()

    # Look for patterns such as:
    # rank 18000
    # rank is 18000
    # rank = 18000
    rank_match = re.search(
        r"rank\s*(?:is|=|:)?\s*(\d+)",
        query_lower
    )

    # Look for admission categories
    category_match = re.search(
        r"\b(general|obc|sc|st)\b",
        query_lower
    )

    rank = None
    category = None

    if rank_match:
        rank = int(rank_match.group(1))

    if category_match:
        category = category_match.group(1)

    return rank, category


# --------------------------------------------------
# 3. RUN ELIGIBILITY TOOL
# --------------------------------------------------

def run_eligibility(query):

    rank, category = extract_rank_and_category(query)

    # If information is missing, ask the user for it
    if rank is None or category is None:

        return {
            "type": "eligibility_check",
            "answer": (
                "Please provide your JEE rank and category. "
                "For example: My rank is 18000 and I am OBC."
            ),
            "sources": [],
            "result": None
        }

    # Call the eligibility tool
    result = check_eligibility(
        rank,
        category
    )

    return {
        "type": "eligibility_check",
        "answer": result["message"],
        "sources": [],
        "result": result
    }


# --------------------------------------------------
# 4. RUN GENERAL RAG
# --------------------------------------------------

def run_general_rag(query):

    # Retrieve relevant documents
    context_docs = retrieve_context(
        query,
        top_k=2
    )

    # Generate grounded answer
    answer, sources = generate_answer(
        query,
        context_docs
    )

    return {
        "type": "general",
        "answer": answer,
        "sources": sources,
        "result": None
    }


# --------------------------------------------------
# 5. MAIN AGENT
# --------------------------------------------------

def run_agent(query, conversation_history=None):

    if conversation_history is None:
        conversation_history = []

    # Step 1: understand follow-up
    standalone_query = rewrite_query(
        query,
        conversation_history
    )

    # Step 2: classify the clarified question
    intent = classify_intent(standalone_query)

    # Step 3: route
    if intent == "eligibility":

        answer = handle_eligibility(standalone_query)

        return {
            "answer": answer,
            "sources": [],
            "type": "eligibility"
        }

    # Step 4: normal RAG
    context_docs = retrieve_context(
        standalone_query
    )

    answer, sources = generate_answer(
        standalone_query,
        context_docs
    )

    return {
        "answer": answer,
        "sources": sources,
        "type": "general"
    }