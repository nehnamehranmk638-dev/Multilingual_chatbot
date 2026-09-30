import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sentence_transformers import SentenceTransformer
from chatbot.repositories.knowledge_repository import insert_documents
from chatbot.db import knowledge_base


# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


sample_docs = [
    {
        "title": "CSE Admission Fee",
        "content": "PLACEHOLDER: Replace this with officially verified IIIT Kottayam B.Tech CSE fee information before using this document for chatbot answers.",
        "category": "fees",
        "language": "en",
        "source": "Official IIIT Kottayam source — TO BE VERIFIED",
        "verified": False,
    },
    {
        "title": "CSE Eligibility",
        "content": "PLACEHOLDER: Replace this with officially verified IIIT Kottayam B.Tech CSE eligibility criteria before using this document for chatbot answers.",
        "category": "eligibility",
        "language": "en",
        "source": "Official IIIT Kottayam source — TO BE VERIFIED",
        "verified": False,
    },
]


# Remove previous test documents
knowledge_base.delete_many({})


# Generate embeddings
for doc in sample_docs:
    embedding = model.encode(doc["content"])
    doc["embedding"] = embedding.tolist()


# Insert documents
inserted_ids = insert_documents(sample_docs)

print(f"Inserted {len(inserted_ids)} documents with embeddings.")