from groq import Groq
from decouple import config
import io
from gtts import gTTS


client = Groq(
    api_key=config("GROQ_API_KEY")
)

# --------------------------------------------------
# Supported gTTS Language Code Mapping
# --------------------------------------------------
GTTS_LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "ml": "ml",
    "ta": "ta",
    "te": "te",
    "kn": "kn",
}


def transcribe_audio(audio_file, language=None):
    """
    Convert uploaded audio into text using Groq Whisper.
    Accepts optional ISO-639-1 language code (en, hi, ml, ta, te, kn).
    """

    # Read Django's uploaded file into bytes
    audio_bytes = audio_file.read()

    # Convert bytes into a normal file-like object
    audio_buffer = io.BytesIO(audio_bytes)

    # Give the buffer a filename
    audio_buffer.name = getattr(
        audio_file,
        "name",
        "audio.wav"
    )

    kwargs = {
        "file": audio_buffer,
        "model": "whisper-large-v3-turbo",
        "response_format": "text",
        "prompt": (
            "IIIT Kottayam. "
            "Indian Institute of Information Technology Kottayam. "
            "B.Tech. "
            "B.Tech admission. "
            "JEE Main. "
            "JoSAA. "
            "CSE. "
            "ECE. "
            "Artificial Intelligence and Data Science. "
            "Computer Science and Engineering. "
            "admission process. "
            "eligibility. "
            "fees. "
            "hostel."
        )
    }

    # Pass language parameter if provided (ISO-639-1 code)
    if language:
        clean_lang = str(language).strip().lower()[:2]
        if clean_lang in GTTS_LANG_MAP:
            kwargs["language"] = clean_lang

    try:
        transcription = client.audio.transcriptions.create(**kwargs)
    except Exception as e:
        # Fallback to whisper-large-v3 if whisper-large-v3-turbo is unavailable
        if kwargs.get("model") == "whisper-large-v3-turbo":
            kwargs["model"] = "whisper-large-v3"
            audio_buffer.seek(0)
            transcription = client.audio.transcriptions.create(**kwargs)
        else:
            raise e

    return transcription


def synthesize_speech(text, lang="en"):
    """
    Convert text into speech MP3 bytes using gTTS.
    Maps input language to GTTS_LANG_MAP.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty for speech synthesis")

    clean_lang = str(lang).strip().lower()
    # Handle language names if passed (e.g. "malayalam" -> "ml")
    name_to_code = {
        "malayalam": "ml",
        "hindi": "hi",
        "tamil": "ta",
        "telugu": "te",
        "kannada": "kn",
        "english": "en",
    }
    code = name_to_code.get(clean_lang, clean_lang[:2])
    target_lang = GTTS_LANG_MAP.get(code, "en")

    tts = gTTS(text=text.strip(), lang=target_lang)
    out_buffer = io.BytesIO()
    tts.write_to_fp(out_buffer)
    out_buffer.seek(0)
    return out_buffer.getvalue()