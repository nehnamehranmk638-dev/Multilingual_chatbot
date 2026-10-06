import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sentence_transformers import SentenceTransformer
from chatbot.db import knowledge_base

model = SentenceTransformer("all-MiniLM-L6-v2")

faculty_directory = [
    # Computer Science & Engineering
    {
        "name": "Dr. Ebin Deni Raj",
        "role": "Associate Dean & Associate Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AC 308 (Second Floor) / AA 117 (Ground Floor), Old Academic Block",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Christina Terese Joseph",
        "role": "HOD (CSE-1) & Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AA 108 (Ground Floor) / AC 318 (Second Floor), Old Academic Block",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Rubell Marion Lincy G.",
        "role": "HOD (CSE-2) & Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room BC 317 (First Floor, New Academic Block) / AB 219 (First Floor, Old Academic Block)",
        "block": "New & Old Academic Blocks"
    },
    {
        "name": "Dr. Arun Cyril Jose",
        "role": "HOD (Cyber Security) & Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AB 213 (First Floor) / AA 122 (Ground Floor), Old Academic Block",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Della Thomas",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room BC 313 (First Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    },
    {
        "name": "Dr. Manu Madhavan",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room BC 307 (First Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    },
    {
        "name": "Dr. P. Victer Paul",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AC 312 (Second Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Balasubramanian P.",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room BD 408 (Second Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    },
    {
        "name": "Dr. Dhakshayani J.",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AB 209 F (First Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Jeena Thomas",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room BA 101 C (Basement Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    },
    {
        "name": "Dr. S. Jai Ganesh",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AC 304 A (Second Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Sivaiah Bellamkonda",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AA 104 (Ground Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. J. V. Bibal Benifa",
        "role": "Associate Dean & Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AA 113 (Ground Floor) / AB 216 (First Floor), Old Academic Block",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Panchami V.",
        "role": "Associate Dean & Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room BD 416 (Second Floor, New Academic Block) / AB 218 (First Floor, Old Academic Block)",
        "block": "New & Old Academic Blocks"
    },
    {
        "name": "Dr. Bakkyaraj T.",
        "role": "Associate Dean & Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AB 212 (First Floor) / AA 118 (Ground Floor), Old Academic Block",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Koppala Guravaiah",
        "role": "Assistant Professor",
        "department": "Computer Science and Engineering",
        "cabins": "Room AA 105 (Ground Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },

    # Electronics & Communication Engineering
    {
        "name": "Dr. Ananth A.",
        "role": "HOD (ECE) & Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "Room AB 208 (First Floor) / AC 313 (Second Floor), Old Academic Block",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Ragesh G. K.",
        "role": "Associate Dean & Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "Cabin CAB 103 B",
        "block": "Faculty Cabin Area"
    },
    {
        "name": "Dr. Vengadeswaran S.",
        "role": "Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "Room BB 210 (Ground Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    },
    {
        "name": "Dr. Sridhar Raj S.",
        "role": "Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "Room AC 317 (Second Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Kala S.",
        "role": "Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "ECE Faculty Department Wing",
        "block": "Old Academic Block"
    },
    {
        "name": "Dr. Bini A. A.",
        "role": "Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "ECE Faculty Department Wing",
        "block": "Old Academic Block"
    },
    {
        "name": "Dr. K. Suriyapriya",
        "role": "Assistant Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "ECE Faculty Department Wing",
        "block": "Old Academic Block"
    },

    # Computational Science & Humanities (CSH / Mathematics / Sciences)
    {
        "name": "Dr. Dhanyamol M. V.",
        "role": "HOD (CSH) & Assistant Professor",
        "department": "Computational Science and Humanities",
        "cabins": "Room BC 316 (First Floor, New Academic Block) / AA 119 (Ground Floor, Old Academic Block)",
        "block": "New & Old Academic Blocks"
    },
    {
        "name": "Dr. Divya Sindhu Lekha",
        "role": "Associate Dean & Assistant Professor",
        "department": "Computational Science and Humanities (Mathematics)",
        "cabins": "Room BD 417 (Second Floor, New Academic Block) / AA 116 (Ground Floor, Old Academic Block)",
        "block": "New & Old Academic Blocks"
    },
    {
        "name": "Dr. Krishnendhu S. P.",
        "role": "Assistant Professor",
        "department": "Computational Science and Humanities",
        "cabins": "Room AA 107 (Ground Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Prof. Ashok S.",
        "role": "Adjunct Professor",
        "department": "Electronics and Communication Engineering",
        "cabins": "Room AC 307 (Second Floor, Old Academic Block)",
        "block": "Old Academic Block (Block A)"
    },
    {
        "name": "Dr. Riyasudheen T. K.",
        "role": "Chief Vigilance Officer (CVO) & Assistant Professor",
        "department": "Computational Science and Humanities",
        "cabins": "Room BD 412 (Second Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    },
    {
        "name": "CyberLabs Innovation & Research Centre",
        "role": "Research Facility",
        "department": "Cyber Security & AI Research",
        "cabins": "Room BD 415 (Second Floor, New Academic Block)",
        "block": "New Academic Block (Block B)"
    }
]

faculty_lines = []
for f in faculty_directory:
    faculty_lines.append(f"- **{f['name']}** ({f['role']}, {f['department']}): {f['cabins']}")

full_content = (
    "Official Faculty Cabin and Office Directory of IIIT Kottayam (iiitkottayam.ac.in):\n\n"
    + "\n".join(faculty_lines)
)

doc = {
    "title": "IIIT Kottayam Faculty Cabin and Office Directory",
    "content": full_content,
    "category": "faculty_cabins",
    "source": "IIIT Kottayam Official Website Faculty Directory (iiitkottayam.ac.in/#!/faculty)",
    "document_type": "official_directory",
    "language": "en",
    "verified": True,
    "status": "current",
    "information_year": 2026,
    "created_at": datetime.utcnow()
}

print("Computing embedding for complete faculty directory...")
doc["embedding"] = model.encode(doc["title"] + "\n" + doc["content"]).tolist()

knowledge_base.update_one(
    {"title": doc["title"]},
    {"$set": doc},
    upsert=True
)

print(f"Successfully seeded directory of {len(faculty_directory)} faculties into MongoDB Atlas.")
