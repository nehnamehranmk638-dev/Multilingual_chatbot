from chatbot.speech import transcribe_audio


with open("test_audio.wav", "rb") as audio_file:

    text = transcribe_audio(audio_file)

print("Transcribed text:")
print(text)