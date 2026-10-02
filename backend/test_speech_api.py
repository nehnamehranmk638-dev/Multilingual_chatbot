import requests


url = "http://127.0.0.1:8000/api/speech/"


with open("test_audio.wav", "rb") as audio:

    response = requests.post(
        url,
        files={
            "audio": (
                "test_audio.wav",
                audio,
                "audio/wav"
            )
        }
    )


print("Status:", response.status_code)
print("Response:")
print(response.json())