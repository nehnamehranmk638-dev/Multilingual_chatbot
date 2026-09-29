import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from chatbot.repositories.knowledge_repository import insert_documents


sample_docs = [
    {
        "title": "CSE Admission Fee",
        "content": "PLACEHOLDER: Replace this with the officially verified IIIT Kottayam B.Tech CSE fee information before using this document for chatbot answers.",
        "category": "fees",
        "language": "en",
        "source": "Official IIIT Kottayam source — TO BE VERIFIED",
        "verified": False,
    },
    {
        "title": "CSE Eligibility",
        "content": "PLACEHOLDER: Replace this with the officially verified IIIT Kottayam B.Tech CSE eligibility criteria before using this document for chatbot answers.",
        "category": "eligibility",
        "language": "en",
        "source": "Official IIIT Kottayam source — TO BE VERIFIED",
        "verified": False,
    },
]


inserted_ids = insert_documents(sample_docs)

print(f"Inserted {len(inserted_ids)} documents.")