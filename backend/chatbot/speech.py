from groq import Groq
from decouple import config
import io


client = Groq(
    api_key=config("GROQ_API_KEY")
)


def transcribe_audio(audio_file):
    """
    Convert uploaded audio into text using Groq Whisper.
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

    transcription = client.audio.transcriptions.create(
        file=audio_buffer,
        model="whisper-large-v3",
        response_format="text",
        prompt=(
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
    )

    return transcription