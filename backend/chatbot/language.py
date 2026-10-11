import json
from groq import Groq
from decouple import config


# --------------------------------------------------
# Supported languages
# --------------------------------------------------

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ml": "Malayalam",
    "te": "Telugu",
    "kn": "Kannada",
    "ta": "Tamil",
}


# --------------------------------------------------
# Groq client
# --------------------------------------------------

client = Groq(
    api_key=config("GROQ_API_KEY")
)


# --------------------------------------------------
# LLM-based language detection + translation
# --------------------------------------------------

DETECT_TRANSLATE_PROMPT = """You are a language detection and translation expert for Indian languages.

Given a user message, you must:
1. Detect which language it is written in
2. Determine if it uses native script or romanized/Latin script
3. Translate it to English

SUPPORTED LANGUAGES:
- en (English)
- hi (Hindi)
- ml (Malayalam)
- ta (Tamil)
- te (Telugu)
- kn (Kannada)

IMPORTANT CONTEXT:
Indian users very commonly type their native language using English/Latin letters instead of native script. These are well-known phenomena:
- "Hinglish" = Hindi written in Latin letters (e.g. "admission ke liye kya karna padega")
- "Manglish" = Malayalam written in Latin letters (e.g. "CSE fee ethra aanu")
- "Tanglish" = Tamil written in Latin letters (e.g. "admission process enna")
- "Tenglish" = Telugu written in Latin letters (e.g. "fee structure enti")
- "Kanglish" = Kannada written in Latin letters (e.g. "admission hege apply maadodu")

Users also frequently CODE-SWITCH — mixing English words/acronyms (like CSE, B.Tech, JEE, IIIT, hostel, fee) into their native language. This is extremely common and does NOT make the message English.

CRITICAL DISTINCTION — MALAYALAM (ml / Manglish) vs TAMIL (ta / Tanglish):
Malayalam and Tamil in romanized script share some historical Dravidian roots, but have distinct vocabulary markers. Do NOT confuse them:
- Malayalam / Manglish markers:
  * "aanu", "aano" (is / are)
  * "ethra", "ethrayaanu" (how much / how many)
  * "enthu", "enthaanu" (what)
  * "evide", "evideyannu" (where)
  * "eppol", "eppozhaanu" (when)
  * "engane", "enganeyaanu" (how)
  * "undu", "undo" (there is / has)
  * "cheyyan", "cheyyuka", "thudangum", "kittumo", "padikkan" (verbal forms)
  * "-il" locative suffix (e.g. "campus il", "hostel il")

- Tamil / Tanglish markers:
  * "irukku", "irukka" (is / are / has)
  * "evlo", "evvalavu", "ethana" (how much / how many)
  * "enna", "ennathu" (what)
  * "enga", "enge" (where)
  * "eppo", "eppothu" (when)
  * "epdi", "eppadi" (how)
  * "panna", "pannalaam", "aagum", "kedaikkuma", "padikka" (verbal forms)
  * "-la" locative suffix (e.g. "campus la", "hostel la")

EXAMPLES:

Hindi (native script):
- "बीटेक की फीस कितनी है?" → en: "What is the B.Tech fee?"
- "प्रवेश प्रक्रिया क्या है?" → en: "What is the admission process?"
- "हॉस्टल में कितना खर्चा आता है?" → en: "How much does the hostel cost?"

Hindi (romanized / Hinglish):
- "btech ki fees kitni hai" → en: "What is the B.Tech fee?"
- "admission ke liye kya karna padega" → en: "What do I need to do for admission?"
- "CSE me kitne seats hain" → en: "How many seats are there in CSE?"

Malayalam (native script):
- "ബിടെക് ഫീസ് എത്രയാണ്?" → en: "What is the B.Tech fee?"
- "അഡ്മിഷൻ പ്രക്രിയ എന്താണ്?" → en: "What is the admission process?"
- "ഹോസ്റ്റൽ ഫീസ് എത്രയാണ്?" → en: "What is the hostel fee?"

Malayalam (romanized / Manglish):
- "CSE fee ethra aanu" → en: "What is the CSE fee?"
- "admission process entha" → en: "What is the admission process?"
- "hostel il ethra per und" → en: "How many people are there in the hostel?"
- "BTech admission eppol thudangum" → en: "When does B.Tech admission start?"
- "hostel facility engane undu" → en: "How is the hostel facility?"
- "campus il evide aanu library" → en: "Where is the library on campus?"
- "application form submit cheyyan enthu cheyyanam" → en: "What should I do to submit the application form?"
- "food nalla reethiyil kittumo" → en: "Will good food be provided?"

Tamil (native script):
- "பி.டெக் கட்டணம் என்ன?" → en: "What is the B.Tech fee?"
- "சேர்க்கை நடைமுறை என்ன?" → en: "What is the admission process?"
- "விடுதி கட்டணம் எவ்வளவு?" → en: "What is the hostel fee?"

Tamil (romanized / Tanglish):
- "admission process enna" → en: "What is the admission process?"
- "CSE la ethana seats iruku" → en: "How many seats are there in CSE?"
- "btech fees evvalavu" → en: "How much is the B.Tech fee?"
- "BTech admission eppo start aagum" → en: "When will B.Tech admission start?"
- "hostel facility epdi irukku" → en: "How is the hostel facility?"
- "campus la enga library irukku" → en: "Where is the library on campus?"
- "application form submit panna enna pannanum" → en: "What should be done to submit the application form?"
- "food nalla irukkuma" → en: "Will the food be good?"

Telugu (native script):
- "బి.టెక్ ఫీజు ఎంత?" → en: "What is the B.Tech fee?"
- "అడ్మిషన్ ప్రక్రియ ఏమిటి?" → en: "What is the admission process?"
- "హాస్టల్ ఫీజు ఎంత?" → en: "What is the hostel fee?"

Telugu (romanized / Tenglish):
- "fee structure enti" → en: "What is the fee structure?"
- "admission ki em cheyali" → en: "What should I do for admission?"
- "CSE lo seats enni unnai" → en: "How many seats are there in CSE?"

Kannada (native script):
- "ಬಿ.ಟೆಕ್ ಶುಲ್ಕ ಎಷ್ಟು?" → en: "What is the B.Tech fee?"
- "ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?" → en: "What is the admission process?"
- "ಹಾಸ್ಟೆಲ್ ಶುಲ್ಕ ಎಷ್ಟು?" → en: "What is the hostel fee?"

Kannada (romanized / Kanglish):
- "admission hege apply maadodu" → en: "How to apply for admission?"
- "CSE fee eshtu" → en: "What is the CSE fee?"
- "hostel facility ide aa" → en: "Is there hostel facility?"

RULES:
1. If the message is already in English, set language_code to "en" and english_translation to the original message.
2. For romanized input: detect the ACTUAL language (not English) even though it uses Latin letters.
3. Code-switched input (mixing English words into a regional language) should be detected as the regional language, not English.
4. Very short queries like "fee?" or "hostel?" that are pure English words should be detected as "en".
5. Preserve technical terms (B.Tech, JEE Main, IIIT Kottayam, CSE, ECE, etc.) in the English translation.

Respond with ONLY valid JSON in this exact format, no other text:
{"language_code": "xx", "is_romanized": true/false, "english_translation": "..."}

User message:
"""


def detect_and_translate(text):
    """
    Detect language and translate to English in a single
    LLM call.

    Handles:
    - Native script (Devanagari, Malayalam, Tamil, Telugu,
      Kannada)
    - Romanized / phonetic Latin input (Hinglish, Manglish,
      Tanglish, Tenglish, Kanglish)
    - Code-switched input (English words mixed into regional
      languages)

    Returns:
        dict with keys:
            language_code  — one of: en, hi, ml, ta, te, kn
            is_romanized   — bool
            english_translation — str
    """

    text = text.strip()

    if not text:
        return {
            "language_code": "en",
            "is_romanized": False,
            "english_translation": text,
        }

    prompt = DETECT_TRANSLATE_PROMPT + text

    try:

        models_to_try = [
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-120b",
        ]
        response = None
        for model_name in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0,
                )
                if response:
                    break
            except Exception:
                continue

        if not response:
            return {
                "language_code": "en",
                "is_romanized": False,
                "english_translation": text,
            }

        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1]
            raw = raw.rsplit("```", 1)[0].strip()

        result = json.loads(raw)

        # Validate language code
        lang = result.get("language_code", "en")
        if lang not in LANG_NAMES:
            lang = "en"

        return {
            "language_code": lang,
            "is_romanized": bool(
                result.get("is_romanized", False)
            ),
            "english_translation": result.get(
                "english_translation", text
            ),
        }

    except (json.JSONDecodeError, KeyError, Exception):
        # JSON parse failure or any error → treat as English
        return {
            "language_code": "en",
            "is_romanized": False,
            "english_translation": text,
        }


# --------------------------------------------------
# Translation
# --------------------------------------------------

def translate_text(
    text,
    source_lang_name,
    target_lang_name
):
    """
    Translate text between supported languages.
    """

    if source_lang_name == target_lang_name:
        return text

    prompt = f"""
Translate the following text from {source_lang_name}
to {target_lang_name}.

The text may contain technical terms, proper nouns,
course names, abbreviations, URLs, or university names.

Rules:
1. Preserve the original meaning.
2. Do not add information.
3. Do not remove information.
4. Keep technical terms such as B.Tech, JEE Main,
   IIIT Kottayam, CSE, etc. unchanged when appropriate.
5. Return ONLY the translation.
6. Do not explain the translation.

Text:
{text}

Translation:
"""

    models_to_try = [
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-120b",
    ]
    response = None
    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0
            )
            if response:
                break
        except Exception:
            continue

    if not response:
        return text

    return response.choices[0].message.content.strip()