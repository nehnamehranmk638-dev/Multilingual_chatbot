from chatbot.conversation import get_conversation_history
from chatbot.agent import rewrite_query

session_id = "demo-session"

history = get_conversation_history(session_id)

query = "What about OBC?"

rewritten = rewrite_query(query, history)

print("\nOriginal:")
print(query)

print("\nRewritten:")
print(rewritten)