"""
One-time utility script: fix_missing_embeddings.py

Finds any knowledge_base documents in MongoDB that lack an embedding
(missing, null, or empty array), computes their 384-dimensional dense
embeddings using sentence-transformers (all-MiniLM-L6-v2), and updates them.
"""

import sys
import os

# Add parent directory to path so chatbot package can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.db import knowledge_base


def fix_missing_embeddings():
    print("=" * 60)
    print("Fixing missing embeddings in knowledge_base collection...")
    print("=" * 60)

    # Query for documents missing the 'embedding' field or where it's None/empty
    query = {
        "$or": [
            {"embedding": {"$exists": False}},
            {"embedding": None},
            {"embedding": []}
        ]
    }

    cursor = knowledge_base.find(query)
    missing_docs = list(cursor)

    total_found = len(missing_docs)
    print(f"Found {total_found} document(s) with missing or empty embeddings.\n")

    if total_found == 0:
        print("[OK] All knowledge_base documents already possess valid embeddings. No action needed.")
        return

    from chatbot.rag import embedding_model

    fixed_count = 0
    for doc in missing_docs:
        doc_id = doc["_id"]
        title = doc.get("title", "Untitled")
        content = doc.get("content", "")

        # Use title + content or content for embedding
        text_to_embed = f"{title}\n{content}" if title and content else (content or title)

        if not text_to_embed.strip():
            print(f"[WARN] Document ID {doc_id} ('{title}') has no content to embed. Skipping.")
            continue

        print(f"Computing embedding for: [{doc_id}] {title[:50]}...")
        embedding = embedding_model.encode(text_to_embed).tolist()

        knowledge_base.update_one(
            {"_id": doc_id},
            {"$set": {"embedding": embedding}}
        )
        fixed_count += 1
        print(f"[OK] Fixed: [{doc_id}] {title} (embedding length: {len(embedding)})")

    print("\n" + "=" * 60)
    print(f"Completed! Successfully updated embeddings for {fixed_count} / {total_found} documents.")
    print("=" * 60)


if __name__ == "__main__":
    fix_missing_embeddings()
