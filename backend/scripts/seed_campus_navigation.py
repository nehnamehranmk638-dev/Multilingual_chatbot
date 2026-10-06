import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sentence_transformers import SentenceTransformer
from chatbot.db import knowledge_base

model = SentenceTransformer("all-MiniLM-L6-v2")

campus_docs = [
    {
        "title": "IIIT Kottayam Campus Blocks and Layout Overview",
        "content": (
            "IIIT Kottayam campus consists of three main academic and administrative buildings: "
            "1. Admin Block: Houses administrative offices, accounts, and directorate. "
            "2. Old Academic Block: Academic building with classrooms starting with letter 'A' (e.g. AA101, AC301). "
            "3. New Academic Block: Multi-story academic building with classrooms starting with letter 'B' (e.g. BA101, BC304). "
            "The student Mess is situated behind the Old Academic Block. "
            "Milma shop is located on the walkway connecting the Old Academic Block to the New Academic Block, behind the Admin Block. "
            "Scoops snack shop and the Medical Room are located on the Ground Floor of the New Academic Block. "
            "Millet food stall is located right near the student Mess."
        ),
        "category": "campus_navigation",
        "source": "IIIT Kottayam Official Campus Map & Navigation Guide",
        "document_type": "campus_guide",
        "language": "en",
        "verified": True,
        "status": "current",
        "information_year": 2026,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Classroom and Room Numbering System (Old Academic vs New Academic Block)",
        "content": (
            "Room numbering system at IIIT Kottayam: "
            "1. Old Academic Block (Rooms starting with 'A'): "
            "All rooms start with letter 'A'. The second letter and first digit indicate the floor. "
            "In Old Academic, 'AA' and '1' represent the Ground Floor (e.g., AA101 is on the Ground Floor). "
            "'AB' or '2' represents the First Floor, and 'AC' or '3' represents the Second/Third Floor (e.g., AC301). "
            "2. New Academic Block (Rooms starting with 'B'): "
            "All rooms start with letter 'B'. The New Academic Block has a Basement floor. "
            "In New Academic, 'BA' and '1' represent the Basement Floor (e.g., BA101 is on the Basement Floor). "
            "'BB' and '2' represent the Ground Floor. "
            "'BC' and '3' represent the First Floor (e.g., BC304 is on the First Floor of New Academic Block). "
            "Therefore, in BA101, 'A1' denotes the Basement floor, whereas in AA101, 'A1' denotes the Ground floor."
        ),
        "category": "campus_navigation",
        "source": "IIIT Kottayam Official Campus Map & Navigation Guide",
        "document_type": "campus_guide",
        "language": "en",
        "verified": True,
        "status": "current",
        "information_year": 2026,
        "created_at": datetime.utcnow()
    },
    {
        "title": "Campus Amenities, Food Outlets, and Medical Facilities",
        "content": (
            "Amenities and locations at IIIT Kottayam: "
            "- Scoops Snack Shop: Located on the Ground Floor of the New Academic Block. "
            "- Medical Room (Health Centre): Located on the Ground Floor of the New Academic Block, right beside Scoops snack shop. "
            "- Milma Shop: Located on the pathway between the Old Academic Block and New Academic Block, just behind the Admin Block. "
            "- Student Mess: Located behind the Old Academic Block. "
            "- Millet Stall: Located right near the student Mess."
        ),
        "category": "campus_navigation",
        "source": "IIIT Kottayam Official Campus Map & Navigation Guide",
        "document_type": "campus_guide",
        "language": "en",
        "verified": True,
        "status": "current",
        "information_year": 2026,
        "created_at": datetime.utcnow()
    }
]

print("Computing embeddings for campus navigation documents...")
for doc in campus_docs:
    embedding = model.encode(doc["title"] + "\n" + doc["content"])
    doc["embedding"] = embedding.tolist()

# Insert or update documents with matching titles
for doc in campus_docs:
    knowledge_base.update_one(
        {"title": doc["title"]},
        {"$set": doc},
        upsert=True
    )

print(f"Successfully seeded/updated {len(campus_docs)} campus navigation documents into MongoDB Atlas.")
