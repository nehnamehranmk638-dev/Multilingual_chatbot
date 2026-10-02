from chatbot.language import detect_language, LANG_NAMES


tests = [
    "What is the B.Tech admission process?",
    "बीटेक प्रवेश प्रक्रिया क्या है?",
    "B.Tech പ്രവേശന പ്രക്രിയ എന്താണ്?",
    "B.Tech சேர்க்கை செயல்முறை என்ன?",
    "B.Tech ప్రవేశ ప్రక్రియ ఏమిటి?",
    "B.Tech ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?",
    "IIIT Kottayam-il B.Tech admission engane aanu?",
    "B.Tech admission ke liye eligibility enthaanu?",
]


for text in tests:

    language = detect_language(text)

    print("=" * 60)
    print("Text:", text)
    print("Detected:", language)
    print("Language:", LANG_NAMES.get(language))