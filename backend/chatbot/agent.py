import re
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from groq import Groq
from decouple import config

from .language import (
    detect_and_translate,
    LANG_NAMES,
    translate_text,
)

from .rag import (
    retrieve_context,
    generate_answer,
)

from .eligibility import check_eligibility


# ============================================================
# GROQ CLIENT
# ============================================================

groq_client = Groq(
    api_key=config("GROQ_API_KEY")
)


# ============================================================
# 1. GREETING / CASUAL MESSAGE DETECTION
# ============================================================

def is_casual_message(query):
    """
    Detect very simple casual/greeting messages before
    conversation rewriting.

    This prevents messages like:
        hi
        hello
        heyy
        how are you?

    from being sent unnecessarily to RAG.
    """

    text = query.lower().strip()

    # Remove basic punctuation
    cleaned = re.sub(r"[!?.,]+$", "", text).strip()

    greetings = {
        "hi",
        "hii",
        "hiii",
        "hello",
        "hey",
        "heyy",
        "heyyy",
        "good morning",
        "good afternoon",
        "good evening",
        "good night",
        "namaste",
    }

    casual_questions = {
        "how are you",
        "how are you doing",
        "what's up",
        "whats up",
    }

    thanks_messages = {
        "thanks",
        "thank you",
        "thankyou",
        "thx",
    }

    if cleaned in greetings:
        return True

    if cleaned in casual_questions:
        return True

    if cleaned in thanks_messages:
        return True

    return False


# ============================================================
# 2. HANDLE GREETING / CASUAL CONVERSATION
# ============================================================

def handle_greeting(query):

    text = query.lower().strip()

    if "how are you" in text:
        return (
            "I'm doing great! 😊 "
            "I'm ready to help you with your queries."
        )

    if (
        "thanks" in text
        or "thank you" in text
        or "thankyou" in text
        or "thx" in text
    ):
        return (
            "You're welcome! 😊 "
            "Feel free to ask me anything about IIIT Kottayam."
        )

    return (
        "Hello! 👋 "
        "I'm here to help you with your queries. "
        "How can I help you?"
    )



# ============================================================
# 3. REWRITE FOLLOW-UP QUESTION
# ============================================================

def rewrite_query(query, conversation_history=None):
    """
    Convert a follow-up question into a standalone question
    using previous conversation context.
    """

    if not conversation_history:
        return query

    history_text = "\n".join(
        f"{msg.get('sender', 'user').capitalize()}: "
        f"{msg.get('content', '')}"
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

1. If the latest question is already standalone,
   return it unchanged.

2. If it is a follow-up question, include the missing
   context from the conversation.

3. Do NOT answer the question.

4. Do NOT add facts that are not present in the
   conversation.

5. Return ONLY the rewritten question.

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

    return response.choices[0].message.content.strip()


def is_campus_navigation_query(query):
    """
    Fast detection for campus location, direction, cabin, and navigation queries.
    Prevents location questions from hitting the general knowledge base RAG pipeline.
    """
    q = query.lower().strip()

    # Room code pattern like AA101, BC304, AC308
    if re.search(r'\b[ab][a-d]\d{2,4}\b', q):
        return True

    # Common location and direction intent phrases
    nav_patterns = [
        r'\bwhere\s+is\b',
        r'\bwhere\'s\b',
        r'\bwhere\s+can\s+i\s+(find|get|reach)\b',
        r'\bhow\s+(can|do)\s+(i|we)\s+(reach|get\s+to|go\s+to|find)\b',
        r'\bdirections?\s+to\b',
        r'\blocation\s+of\b',
        r'\bway\s+to\b',
        r'\bpath\s+to\b',
        r'\b(cabin|office)\s+(of|for|\b)',
        r'\bwhich\s+(floor|block|building|room)\b',
        r'\bhow\s+to\s+reach\b',
        r'\bhow\s+to\s+get\s+to\b',
        r'\bcampus\s+map\b',
    ]
    for pat in nav_patterns:
        if re.search(pat, q):
            return True

    # Landmark mentions in combination with navigation verbs
    landmarks = [
        "mess", "milma", "scoops", "millet", "academic block", "admin block",
        "old academic", "new academic", "hostel", "warden", "canteen", "library",
        "health centre", "medical room", "atm", "gym"
    ]
    nav_verbs = ["where", "how", "reach", "route", "direction", "locate", "situated", "spot", "find", "map"]
    if any(lm in q for lm in landmarks) and any(nv in q for nv in nav_verbs):
        return True

    return False


# ============================================================
# 4. CLASSIFY USER INTENT
# ============================================================

def classify_intent(query):

    # Fast pattern match for campus location/direction queries
    if is_campus_navigation_query(query):
        return "campus_navigation"

    prompt = f"""
Classify this user message for an IIIT Kottayam
admission chatbot.

Reply with ONLY ONE category.

Categories:

1. greeting

   Casual conversation, greetings, or simple social
   questions.

   Examples:
   - hi
   - hello
   - hey
   - heyy
   - good morning
   - how are you?
   - thanks
   - thank you

2. eligibility_check

   The user gives a JEE rank and/or category and asks
   whether they can get admission or which branch they
   may get.

   Examples:
   - My rank is 18000 and I am OBC. Can I get CSE?
   - I got 12000 rank, can I get admission?
   - Can I get CSE with rank 5000?

3. campus_navigation

   Any query asking about campus locations, directions, where a building/room/hostel/facility is, or where a faculty member's cabin or office is located.

   Examples:
   - Where is Dr. Dhakshayani's cabin?
   - Where is the mess?
   - How do I reach the hostel?
   - Where is room BC304?
   - Where is Dr. Ebin Deni Raj's cabin?
   - Location of Old Academic Block
   - Where is Milma?
   - Where is the medical room?
   - Directions to New Academic Block

4. general

   Any actual IIIT Kottayam admission or academic
   question.

   Examples:
   - What is the B.Tech fee?
   - What is the admission process?
   - What documents are required?
   - What are the hostel fees?
   - What courses are available?
   - What is the eligibility criteria?

Important rules:

- Greetings and casual conversation MUST be classified
  as greeting.

- Admission-related questions MUST be classified as
  general unless they specifically involve a JEE rank
  and/or category for admission/branch prediction.

User message:
{query}

Category:
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

    intent = (
        response.choices[0]
        .message
        .content
        .strip()
        .lower()
    )

    # Safety check
    allowed_intents = [
        "greeting",
        "general",
        "eligibility_check",
        "campus_navigation",
    ]

    if intent not in allowed_intents:
        intent = "general"

    return intent


# ============================================================
# 5. EXTRACT RANK AND CATEGORY
# ============================================================

def extract_rank_and_category(query):

    query_lower = query.lower()

    # Examples:
    # rank 18000
    # rank is 18000
    # rank = 18000
    # rank: 18000

    rank_match = re.search(
        r"\brank\s*(?:is|=|:)?\s*(\d+)",
        query_lower
    )

    # Admission categories
    category_match = re.search(
        r"\b(general|obc|sc|st|ews)\b",
        query_lower
    )

    rank = None
    category = None

    if rank_match:
        rank = int(rank_match.group(1))

    if category_match:
        category = category_match.group(1)

    return rank, category


# ============================================================
# 6. RUN ELIGIBILITY TOOL
# ============================================================

def run_eligibility(query):

    rank, category = extract_rank_and_category(query)

    # Missing required information
    if rank is None or category is None:

        return {
            "type": "eligibility_check",
            "answer": (
                "Please provide your JEE rank and category. "
                "For example: My rank is 18000 and I am OBC."
            ),
            "sources": [],
            "result": None,
        }

    # Call eligibility checker
    result = check_eligibility(
        rank,
        category
    )

    return {
        "type": "eligibility_check",
        "answer": result["message"],
        "sources": [],
        "result": result,
    }


# ============================================================
# 7. CAMPUS ROOM & NAVIGATION RESOLVER
# ============================================================

def resolve_room_location(query):
    """
    Directly validates and resolves IIIT Kottayam room codes:
    - Old Academic: 'A' prefix. Floor letter and digit must match (A=1, B=2, C=3, D=4).
      AA1xx -> Ground Floor
      AB2xx -> First Floor
      AC3xx -> Second Floor
      AD4xx -> Third Floor
    - New Academic: 'B' prefix. Floor letter and digit must match (A=1, B=2, C=3, D=4).
      BA1xx -> Basement Floor
      BB2xx -> Ground Floor
      BC3xx -> First Floor
      BD4xx -> Second Floor
    """
    query_upper = query.upper()

    # Match room patterns like AA101, BA101, BA301, BC304, AA126
    room_match = re.search(r'\b([AB])([A-D])(\d{2,4})\b', query_upper)
    
    if room_match:
        building_code = room_match.group(1) # 'A' or 'B'
        floor_letter = room_match.group(2)  # 'A', 'B', 'C', 'D'
        digits = room_match.group(3)        # '101', '301', etc.
        floor_digit = digits[0]             # '1', '2', '3', '4'
        full_code = f"{building_code}{floor_letter}{digits}"

        letter_to_digit = {
            'A': '1',
            'B': '2',
            'C': '3',
            'D': '4'
        }

        # -------------------------------------------------------------
        # STRICT VALIDATION: Check if letter and digit match
        # -------------------------------------------------------------
        expected_digit = letter_to_digit.get(floor_letter)
        if floor_digit != expected_digit:
            return {
                "answer": f"**{full_code}** is an invalid room number because the floor letter ('{floor_letter}') and floor number ('{floor_digit}') do not match.",
                "sources": ["IIIT Kottayam Official Campus Map & Navigation Guide"],
                "type": "campus_navigation"
            }

        # -------------------------------------------------------------
        # VALID ROOMS
        # -------------------------------------------------------------
        if building_code == 'A':
            floors_old = {
                'A': 'Ground Floor',
                'B': 'First Floor',
                'C': 'Second Floor',
                'D': 'Third Floor'
            }
            floor_name = floors_old.get(floor_letter, 'Ground Floor')
            return {
                "answer": f"Room **{full_code}** is located on the **{floor_name}** of the **Old Academic Block (Block A)**.",
                "sources": ["IIIT Kottayam Official Campus Map & Navigation Guide"],
                "type": "campus_navigation"
            }

        elif building_code == 'B':
            floors_new = {
                'A': 'Basement Floor',
                'B': 'Ground Floor',
                'C': 'First Floor',
                'D': 'Second Floor'
            }
            floor_name = floors_new.get(floor_letter, 'Basement Floor')
            return {
                "answer": f"Room **{full_code}** is located on the **{floor_name}** of the **New Academic Block (Block B)**.",
                "sources": ["IIIT Kottayam Official Campus Map & Navigation Guide"],
                "type": "campus_navigation"
            }

    return None



# ============================================================
# 8. RUN GENERAL RAG
# ============================================================


def run_general_rag(query, session_id=None):

    # Retrieve relevant documents
    context_docs = retrieve_context(
        query,
        top_k=4,
    )

    # Generate grounded answer
    answer, sources = generate_answer(
        query,
        context_docs,
        session_id=session_id
    )

    return {
        "type": "general",
        "answer": answer,
        "sources": sources,
        "result": None,
    }


# ============================================================
# 8. MAIN AGENT
# ============================================================

def run_agent(
    query,
    conversation_history=None,
    session_id=None,
    *args,
    **kwargs
):
    """
    Main agent pipeline.

    Flow:

    User query
          |
          v
    Casual message?
       /       \
     YES       NO
      |         |
   Greeting   Rewrite
                |
                v
             Classify
          /      |       \
    greeting eligibility general
       |          |        |
       v          v        v
    Response     Tool     RAG
    """

    if conversation_history is None:
        conversation_history = []

    # --------------------------------------------------------
    # Step 1: Handle obvious greetings BEFORE rewriting
    # --------------------------------------------------------

    if is_casual_message(query):

        answer = handle_greeting(query)

        return {
            "answer": answer,
            "sources": [],
            "type": "greeting",
        }

    # --------------------------------------------------------
    # Step 2: Rewrite follow-up question
    # --------------------------------------------------------

    standalone_query = rewrite_query(
        query,
        conversation_history
    )

    # --------------------------------------------------------
    # Step 3: Classify rewritten query
    # --------------------------------------------------------

    intent = classify_intent(
        standalone_query
    )

    print("\n========================================")
    print("AGENT")
    print("Original query:", query)
    print("Standalone query:", standalone_query)
    print("Intent:", intent)
    print("========================================")

    # --------------------------------------------------------
    # Step 4: Greeting
    # --------------------------------------------------------

    if intent == "greeting":

        answer = handle_greeting(
            standalone_query
        )

        return {
            "answer": answer,
            "sources": [],
            "type": "greeting",
        }

    # --------------------------------------------------------
    # Step 5: Eligibility
    # --------------------------------------------------------

    if intent == "eligibility_check":

        result = run_eligibility(
            standalone_query
        )

        return {
            "answer": result["answer"],
            "sources": result["sources"],
            "type": result["type"],
        }

    # --------------------------------------------------------
    # Step 6: Campus Navigation / Location Intent Check
    # --------------------------------------------------------

    if intent == "campus_navigation":
        # Check if the query is a strict room number (e.g. BC304, AA101)
        room_nav_result = resolve_room_location(standalone_query)
        if room_nav_result:
            return room_nav_result

        return {
            "answer": (
                "For campus locations, walking directions, and faculty cabin details, please check the "
                "**Campus Map & Directory 🗺️** — you can open it anytime using the **Compass icon (Campus Map)** "
                "in the top navigation bar or via the **Campus Map & Room Finder** card on your Home Dashboard."
            ),
            "sources": ["IIIT Kottayam Official Campus Map & Directory"],
            "type": "campus_navigation",
        }

    # --------------------------------------------------------
    # Step 7: General RAG
    # --------------------------------------------------------

    result = run_general_rag(
        standalone_query,
        session_id=session_id
    )

    return {
        "answer": result["answer"],
        "sources": result["sources"],
        "type": result["type"],
    }



# ============================================================
# 9. MULTILINGUAL QUERY PROCESSING
# ============================================================

def process_multilingual_query(
    user_message,
    conversation_history=None,
    session_id=None,
    *args,
    **kwargs
):
    """
    Multilingual processing pipeline.

    1. Detect language
    2. Translate user query to English
    3. Run the existing M4/M5 agent
    4. Translate the final answer back to the user's language
    5. Return language metadata
    """

    if conversation_history is None:
        conversation_history = []

    # --------------------------------------------------------
    # Step 1+2: Detect language AND translate in one LLM call
    # --------------------------------------------------------

    detection = detect_and_translate(user_message)

    language_code = detection["language_code"]
    is_romanized = detection["is_romanized"]
    english_query = detection["english_translation"]

    language_name = LANG_NAMES.get(
        language_code,
        "English"
    )

    print("\n========================================")
    print("MULTILINGUAL PIPELINE")
    print("Original:", user_message)
    print("Detected:", language_code)
    print("Language:", language_name)
    print("Romanized:", is_romanized)
    print("English query:", english_query)
    print("========================================")

    # --------------------------------------------------------
    # Step 3: Process through agent
    # --------------------------------------------------------

    result = run_agent(
        english_query,
        conversation_history,
        session_id=session_id
    )

    answer = result["answer"]
    sources = result["sources"]
    answer_type = result["type"]

    # Double-check: if answer indicates information is unavailable, do NOT show sources
    eng_lower = (answer or "").lower()
    if any(phrase in eng_lower for phrase in [
        "not available in the",
        "not available in provided",
        "couldn't find a verified answer",
        "could not find a verified answer",
        "does not contain information",
        "does not contain any information",
        "information is not available",
    ]):
        sources = []

    # --------------------------------------------------------
    # Step 4: Translate answer back to user's language
    # --------------------------------------------------------

    if language_code != "en" and answer:

        answer = translate_text(
            answer,
            "English",
            language_name
        )

    # --------------------------------------------------------
    # Step 5: Return final result
    # --------------------------------------------------------

    return {
        "original_query": user_message,
        "answer": answer,
        "sources": sources,
        "type": answer_type,
        "language": language_code,
        "language_name": language_name,
        "translated_query": english_query,
    }
