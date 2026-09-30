from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


def create_embedding(text):
    """
    Convert text into a 384-dimensional embedding.
    """
    embedding = model.encode(text)

    return embedding.tolist()
