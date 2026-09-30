from chatbot.rag import retrieve_context


query = "What is the B.Tech fee for Admission 2026?"

results = retrieve_context(query, top_k=2)

print("\nRetrieved documents:")
print("====================")

for i, doc in enumerate(results, start=1):
    print(f"\nDocument {i}")
    print("Title:", doc.get("title"))
    print("Category:", doc.get("category"))
    print("Verified:", doc.get("verified"))
    print("Content:", doc.get("content"))