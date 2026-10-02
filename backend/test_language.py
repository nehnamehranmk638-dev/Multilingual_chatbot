from chatbot.language import detect_language, LANG_NAMES

test_sentences = [
    "What is the B.Tech admission process?",
    "बीटेक प्रवेश प्रक्रिया क्या है?",
    "B.Tech പ്രവേശന പ്രക്രിയ എന്താണ്?",
    "B.Tech சேர்க்கை செயல்முறை என்ன?",
    "B.Tech ప్రవేశ ప్రక్రియ ఏమిటి?",
    "B.Tech ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?",
]

for text in test_sentences:
    code = detect_language(text)
    print(f"{text}")
    print(f"Detected: {code} - {LANG_NAMES.get(code, 'Unknown')}")
    print("-" * 50)