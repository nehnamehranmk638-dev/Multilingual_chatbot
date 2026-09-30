from chatbot.rag import get_recent_history, rewrite_query_with_context

session_id = "test-context"

history = get_recent_history(session_id)

print("\nConversation history:")
print("====================")

for message in history:
    print(
        f"{message['sender']}: "
        f"{message['content']}"
    )

query = "What about OBC?"

rewritten = rewrite_query_with_context(
    query,
    history
)

print("\nOriginal:")
print(query)

print("\nRewritten:")
print(rewritten)