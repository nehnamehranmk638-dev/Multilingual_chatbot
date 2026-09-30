from embedding import create_embedding


text = "IIIT Kottayam offers B.Tech programmes."

embedding = create_embedding(text)

print("Embedding created successfully.")
print("Dimensions:", len(embedding))
print("First 5 values:", embedding[:5])