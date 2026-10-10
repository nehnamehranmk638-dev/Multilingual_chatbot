import sys
import os
import re
import argparse

# Allow importing from backend directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from chatbot.db import knowledge_base


def find_phd_mtech_documents():
    """
    Find all documents in knowledge_base where category is 'phd' or 'mtech' (case-insensitive).
    """
    regex = re.compile(r"^(phd|mtech)$", re.IGNORECASE)
    query = {"category": regex}
    return list(knowledge_base.find(query))


def main():
    parser = argparse.ArgumentParser(
        description="One-time cleanup script to delete all 'phd' and 'mtech' category documents."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List matching documents without deleting or prompting."
    )
    args = parser.parse_args()

    docs = find_phd_mtech_documents()
    count = len(docs)

    print("=" * 60)
    print("KNOWLEDGE BASE CLEANUP: PHD & MTECH DOCUMENTS")
    print("=" * 60)
    print(f"Total matching documents found: {count}\n")

    if count == 0:
        print("No documents found with category 'phd' or 'mtech'. Nothing to delete.")
        return

    print("Documents identified for removal:")
    print("-" * 60)
    for i, doc in enumerate(docs, 1):
        doc_id = str(doc.get("_id"))
        category = doc.get("category", "")
        title = doc.get("title", "Untitled")
        print(f"{i}. [{category}] {title} (ID: {doc_id})")
    print("-" * 60)

    if args.dry_run:
        print("\n[DRY RUN] No documents were deleted.")
        return

    print("\nWARNING: This will permanently delete these documents from MongoDB.")
    confirm = input("Type 'yes' to confirm deletion of these documents: ").strip()

    if confirm.lower() == "yes":
        regex = re.compile(r"^(phd|mtech)$", re.IGNORECASE)
        result = knowledge_base.delete_many({"category": regex})
        print(f"\nSUCCESS: Deleted {result.deleted_count} documents from the knowledge base.")
    else:
        print("\nABORTED: Deletion cancelled. No documents were removed.")


if __name__ == "__main__":
    main()
