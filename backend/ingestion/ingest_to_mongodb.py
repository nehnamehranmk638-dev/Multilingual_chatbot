import sys
from pathlib import Path

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[1])
)

from pathlib import Path
from datetime import datetime

from docx import Document
from sentence_transformers import SentenceTransformer

from chatbot.db import knowledge_base


# --------------------------------------------------
# File location
# --------------------------------------------------

DOCUMENT_PATH = (
    Path(__file__).resolve().parents[2]
    / "knowledge_base"
    / "iiitk_knowledge_base.docx"
)


# --------------------------------------------------
# Embedding model
# --------------------------------------------------

MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)


# --------------------------------------------------
# Extract sections from DOCX
# --------------------------------------------------

def extract_sections():

    document = Document(DOCUMENT_PATH)

    sections = []

    current_title = None
    current_content = []

    # -----------------------------
    # Read normal paragraphs
    # -----------------------------

    for paragraph in document.paragraphs:

        text = paragraph.text.strip()

        if not text:
            continue

        if (
            len(text) > 2
            and text[0].isdigit()
            and "." in text[:4]
        ):

            if current_title and current_content:
                sections.append({
                    "title": current_title,
                    "content": "\n".join(current_content)
                })

            current_title = text
            current_content = []

        else:
            current_content.append(text)

    # -----------------------------
    # Read tables
    # -----------------------------

    for table in document.tables:

        table_rows = []

        for row in table.rows:

            cells = []

            for cell in row.cells:
                cell_text = cell.text.strip()

                if cell_text:
                    cells.append(cell_text)

            if cells:
                table_rows.append(" | ".join(cells))

        if table_rows:

            table_text = "\n".join(table_rows)

            if current_title:
                current_content.append(
                    "\nTABLE:\n" + table_text
                )
            else:
                sections.append({
                    "title": "Untitled Table",
                    "content": table_text
                })

    # Save final section

    if current_title and current_content:

        sections.append({
            "title": current_title,
            "content": "\n".join(current_content)
        })

    return sections

# --------------------------------------------------
# Create MongoDB documents
# --------------------------------------------------

def create_documents(sections):

    documents = []

    for section in sections:

        content = section["content"]

        # Create embedding from title + content
        embedding_text = (
            section["title"]
            + "\n"
            + content
        )

        embedding = model.encode(
            embedding_text
        ).tolist()

        title_lower = section["title"].lower()

        # Determine category from the section title
        if "fee" in title_lower:
            category = "fees"

        elif "admission" in title_lower:
            category = "admissions"

        elif "b.tech" in title_lower or "btech" in title_lower:
            category = "btech"

        elif "m.tech" in title_lower or "mtech" in title_lower:
            category = "mtech"

        elif "phd" in title_lower:
            category = "phd"

        elif "hostel" in title_lower:
            category = "hostel"

        elif "placement" in title_lower:
            category = "placements"

        elif "contact" in title_lower:
            category = "contact"

        elif "institute" in title_lower:
            category = "institute"

        else:
            category = "general"


        document = {
            "title": section["title"],
            "content": content,
            "embedding": embedding,

            # Metadata
            "category": category,
            "source": "IIIT Kottayam Official Knowledge Base",
            "document_type": "official_knowledge_base",
            "language": "en",
            "verified": True,
            "status": "current",
            "information_year": 2026,
            "last_verified": "2026-09",

            "created_at": datetime.utcnow()
        }

        documents.append(document)

    return documents


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    print("Reading knowledge base...")

    sections = extract_sections()

    print(
        f"Found {len(sections)} sections."
    )

    print("Creating embeddings...")

    documents = create_documents(sections)

    print(
        f"Created {len(documents)} documents."
    )

    # IMPORTANT:
    # Remove our old placeholder documents
    print("Removing old knowledge base...")

    knowledge_base.delete_many({})

    # Insert the real knowledge base
    print("Uploading to MongoDB Atlas...")

    result = knowledge_base.insert_many(
        documents
    )

    print(
        f"Successfully inserted "
        f"{len(result.inserted_ids)} documents."
    )