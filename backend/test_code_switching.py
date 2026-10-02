import requests


URL = "http://127.0.0.1:8000/api/chat/"


tests = [
    {
        "text": "IIIT Kottayam-il B.Tech admission engane aanu?",
        "description": "Malayalam + English"
    },
    {
        "text": "B.Tech admission ke liye eligibility enthaanu?",
        "description": "Hindi + Malayalam + English"
    },
    {
        "text": "IIIT Kottayam-la B.Tech admission eppadi?",
        "description": "Tamil + English"
    },
    {
        "text": "B.Tech admission gurinchi cheppandi",
        "description": "Telugu + English"
    },
    {
        "text": "B.Tech admission ಬಗ್ಗೆ ಹೇಳಿ",
        "description": "Kannada + English"
    }
]


for i, test in enumerate(tests, start=1):

    print("\n" + "=" * 60)
    print(f"TEST {i}: {test['description']}")
    print("=" * 60)

    print("Input:")
    print(test["text"])

    response = requests.post(
        URL,
        json={
            "message": test["text"],
            "session_id": f"codeswitch-test-{i}"
        }
    )

    print("\nStatus:")
    print(response.status_code)

    data = response.json()

    print("\nDetected language:")
    print(data.get("language"))

    print("\nTranslated query:")
    print(data.get("translated_query"))

    print("\nAnswer:")
    print(data.get("answer"))