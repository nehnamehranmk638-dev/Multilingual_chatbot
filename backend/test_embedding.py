from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

text = "What is the admission fee for B.Tech CSE?"

embedding = model.encode(text)

print("Embedding type:", type(embedding))
print("Embedding dimensions:", len(embedding))
print("First 5 values:", embedding[:5])