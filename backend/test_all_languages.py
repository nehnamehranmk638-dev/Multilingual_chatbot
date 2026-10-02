import requests


URL = "http://127.0.0.1:8000/api/chat/"


tests = [
    {
        "language": "English",
        "text": "What is the B.Tech admission process?"
    },
    {
        "language": "Hindi",
        "text": "बीटेक प्रवेश प्रक्रिया क्या है?"
    },
    {
        "language": "Malayalam",
        "text": "B.Tech പ്രവേശന പ്രക്രിയ എന്താണ്?"
    },
    {
        "language": "Tamil",
        "text": "B.Tech சேர்க்கை செயல்முறை என்ன?"
    },
    {
        "language": "Telugu",
        "text": "B.Tech ప్రవేశ ప్రక్రియ ఏమిటి?"
    },
    {
        "language": "Kannada",
        "text": "B.Tech ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?"
    }
]


for i, test in enumerate(tests, start=1):

    print("\n" + "=" * 60)
    print(f"TEST {i}: {test['language']}")
    print("=" * 60)

    response = requests.post(
        URL,
        json={
            "message": test["text"],
            "session_id": f"language-test-{i}"
        }
    )

    print("Status:", response.status_code)

    try:
        data = response.json()

        print("Input:")
        print(test["text"])

        print("\nDetected language:")
        print(data.get("language"))

        print("\nTranslated query:")
        print(data.get("translated_query"))

        print("\nAnswer:")
        print(data.get("answer"))

        print("\nSources:")
        print(data.get("sources"))

    except Exception:
        print(response.text)