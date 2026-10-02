from chatbot.agent import process_multilingual_query


result = process_multilingual_query(
    "B.Tech ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?",
    conversation_history=[]
)

print("\n========== RESULT ==========")

print("Detected language:")
print(result["language_name"])

print("\nOriginal query:")
print(result["original_query"])

print("\nTranslated query:")
print(result["translated_query"])

print("\nAnswer:")
print(result["answer"])

print("\nSources:")
print(result["sources"])

print("\nType:")
print(result["type"])