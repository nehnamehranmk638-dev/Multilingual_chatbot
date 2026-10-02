from chatbot.language import (
    detect_language,
    translate_text,
    LANG_NAMES
)


text = "B.Tech ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?"

code = detect_language(text)
language_name = LANG_NAMES[code]

print("Original:")
print(text)

print("\nDetected language:")
print(language_name)

translated = translate_text(
    text,
    language_name,
    "English"
)

print("\nEnglish translation:")
print(translated)