from langdetect import detect, DetectorFactory
from groq import Groq
from decouple import config


# --------------------------------------------------
# Make langdetect deterministic
# --------------------------------------------------

DetectorFactory.seed = 0


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
# Script-based language detection
# --------------------------------------------------

def detect_script_language(text):
    """
    Detect Indian language based on Unicode script.

    Returns:
        hi = Hindi
        ml = Malayalam
        ta = Tamil
        te = Telugu
        kn = Kannada
        en = English / Latin script
    """

    for char in text:

        code = ord(char)

        # Devanagari → Hindi
        if 0x0900 <= code <= 0x097F:
            return "hi"

        # Malayalam
        if 0x0D00 <= code <= 0x0D7F:
            return "ml"

        # Tamil
        if 0x0B80 <= code <= 0x0BFF:
            return "ta"

        # Telugu
        if 0x0C00 <= code <= 0x0C7F:
            return "te"

        # Kannada
        if 0x0C80 <= code <= 0x0CFF:
            return "kn"

    return "en"


# --------------------------------------------------
# Language detection
# --------------------------------------------------

def detect_language(text):
    """
    Detect the language of the user's message.

    Strategy:

    1. Check Unicode script first.
       This handles Indian-language scripts reliably.

    2. If the text contains only Latin characters,
       use langdetect.

    3. If detection fails, default to English.
    """

    text = text.strip()

    if not text:
        return "en"

    # ----------------------------------------------
    # 1. Script detection
    # ----------------------------------------------

    script_language = detect_script_language(text)

    if script_language != "en":
        return script_language

    # ----------------------------------------------
    # 2. langdetect for Latin-script text
    # ----------------------------------------------

    try:

        detected = detect(text)

        # Only accept our supported languages
        if detected in LANG_NAMES:
            return detected

    except Exception:
        pass

    # ----------------------------------------------
    # 3. Safe fallback
    # ----------------------------------------------

    return "en"


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