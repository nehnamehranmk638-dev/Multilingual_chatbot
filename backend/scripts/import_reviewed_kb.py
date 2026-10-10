#!/usr/bin/env python3
"""
IIIT Kottayam Knowledge Base Importer
=======================================
Takes a reviewed JSON file (scraped_candidates.json after human review),
computes embeddings, and upserts documents into MongoDB's knowledge_base collection.

Usage:
    python backend/scripts/import_reviewed_kb.py
    python backend/scripts/import_reviewed_kb.py --input my_reviewed_file.json
    python backend/scripts/import_reviewed_kb.py --dry-run

IMPORTANT:
  - NEVER run this on the raw scraped_candidates.json without human review.
  - Only documents with "verified": true will be treated as staff-approved.
    Unverified entries are still imported (for admin review) but flagged as unverified.
  - The script does NOT set verified=True automatically for any document.
"""

import os
import sys
import json
import argparse
import hashlib
from datetime import datetime, timezone

# Adjust sys.path so Django settings and chatbot modules are importable
# when running as: python backend/scripts/import_reviewed_kb.py
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django
django.setup()

from sentence_transformers import SentenceTransformer
from chatbot.db import knowledge_base
from bson import ObjectId

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_INPUT = os.path.join(SCRIPT_DIR, "scraped_candidates.json")
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Similarity threshold for content-level deduplication (cosine similarity).
# Chunks from the SAME source URL with content fingerprints that start with
# the same 200 chars are treated as duplicates (exact match check, not cosine).
DUPLICATE_FINGERPRINT_CHARS = 200


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _content_fingerprint(content: str) -> str:
    """Short deterministic fingerprint for deduplication."""
    normalized = " ".join(content.lower().split())[:300]
    return hashlib.md5(normalized.encode()).hexdigest()


def load_candidates(filepath: str) -> list[dict]:
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError(f"Input JSON must be a list of documents. Got: {type(data)}")
    print(f"Loaded {len(data)} candidate documents from {filepath}")
    return data


def compute_embeddings(texts: list[str], model) -> list[list[float]]:
    """Batch-encode texts. Returns list of 384-dim float vectors."""
    print(f"  Computing embeddings for {len(texts)} text(s)...")
    vectors = model.encode(texts, show_progress_bar=True, batch_size=32)
    return [v.tolist() for v in vectors]


def find_existing_doc(source_url: str, fingerprint: str):
    """
    Return the existing MongoDB document if:
      - Same source URL AND same content fingerprint (exact duplicate), OR
      - Same source URL AND only 1 chunk exists for that URL (single-page update)
    Returns None if no match found.
    """
    # Exact fingerprint match for that URL
    existing = knowledge_base.find_one({
        "source": source_url,
        "content_fingerprint": fingerprint,
    })
    if existing:
        return existing

    return None


# ---------------------------------------------------------------------------
# Main import logic
# ---------------------------------------------------------------------------

def run_import(candidates: list[dict], model, dry_run: bool = False):
    stats = {
        "inserted": 0,
        "updated": 0,
        "skipped_exact_duplicate": 0,
        "errors": 0,
    }

    # Validate all entries have required fields
    required_fields = ["title", "content", "category", "language", "source", "verified"]
    valid_candidates = []
    for i, doc in enumerate(candidates):
        missing = [f for f in required_fields if f not in doc]
        if missing:
            print(f"  [WARN] Document #{i} is missing fields {missing} — skipping.")
            stats["errors"] += 1
            continue
        if not doc.get("content", "").strip():
            print(f"  [WARN] Document #{i} has empty content — skipping.")
            stats["errors"] += 1
            continue
        if not doc.get("source", "").strip():
            print(f"  [WARN] Document #{i} has no source URL — skipping.")
            stats["errors"] += 1
            continue
        valid_candidates.append(doc)

    print(f"\nValid candidates to process: {len(valid_candidates)}")

    # Batch compute embeddings for all valid docs
    texts = [doc["content"] for doc in valid_candidates]
    embeddings = compute_embeddings(texts, model)

    print(f"\nProcessing documents...")

    # Pre-fetch existing documents to minimize MongoDB round-trips
    print("  Indexing existing documents from MongoDB...")
    existing_list = list(knowledge_base.find({}, {
        "source": 1,
        "content_fingerprint": 1,
        "title": 1,
        "verified": 1,
        "created_at": 1
    }))

    existing_by_fp = {
        (doc.get("source"), doc.get("content_fingerprint")): doc
        for doc in existing_list
        if "source" in doc and "content_fingerprint" in doc
    }
    existing_by_source_title = {
        (doc.get("source"), doc.get("title")): doc
        for doc in existing_list
        if "source" in doc and "title" in doc
    }
    print(f"  Found {len(existing_list)} existing documents in KB.")

    to_insert = []
    now = datetime.now(timezone.utc)

    for doc, embedding in zip(valid_candidates, embeddings):
        source = doc["source"].strip()
        content = doc["content"].strip()
        fingerprint = _content_fingerprint(content)

        # Check for exact duplicate in MongoDB
        if (source, fingerprint) in existing_by_fp:
            stats["skipped_exact_duplicate"] += 1
            continue

        existing_by_source = existing_by_source_title.get((source, doc["title"]))

        kb_doc = {
            "title": doc["title"].strip(),
            "content": content,
            "category": doc.get("category", "general"),
            "language": doc.get("language", "en"),
            "source": source,
            "verified": bool(doc.get("verified", False)),
            "embedding": embedding,
            "content_fingerprint": fingerprint,
            "last_scraped_at": now,
        }

        if dry_run:
            if existing_by_source:
                stats["updated"] += 1
            else:
                stats["inserted"] += 1
            continue

        if existing_by_source:
            # Update in place — preserve _id and existing verified status if already True
            existing_verified = existing_by_source.get("verified", False)
            if existing_verified and not kb_doc["verified"]:
                kb_doc["verified"] = True

            kb_doc["created_at"] = existing_by_source.get("created_at", now)
            knowledge_base.update_one(
                {"_id": existing_by_source["_id"]},
                {"$set": kb_doc}
            )
            stats["updated"] += 1
        else:
            kb_doc["created_at"] = now
            to_insert.append(kb_doc)
            # update local index to prevent inserting duplicate within same batch
            existing_by_fp[(source, fingerprint)] = kb_doc
            existing_by_source_title[(source, kb_doc["title"])] = kb_doc

    if to_insert and not dry_run:
        print(f"  Bulk inserting {len(to_insert)} new documents into MongoDB...")
        knowledge_base.insert_many(to_insert)
        stats["inserted"] += len(to_insert)

    return stats


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Import reviewed KB candidates into MongoDB knowledge_base."
    )
    parser.add_argument(
        "--input",
        default=DEFAULT_INPUT,
        help=f"Path to reviewed JSON file (default: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what would be inserted/updated without touching MongoDB.",
    )
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"[ERROR] Input file not found: {args.input}")
        print("Did you run scrape_full_site.py first?")
        sys.exit(1)

    if args.dry_run:
        print("=" * 60)
        print("DRY RUN MODE — no changes will be made to MongoDB")
        print("=" * 60)
    else:
        print("=" * 60)
        print("IIIT Kottayam KB Importer")
        print("=" * 60)
        print("IMPORTANT: Only run this on a HUMAN-REVIEWED JSON file.")
        print("  Verified=True entries are staff-approved.")
        print("  Verified=False entries will appear in Admin > Knowledge Base")
        print("  filtered by 'Unverified' for further review.")
        print()

    # Load candidates
    candidates = load_candidates(args.input)

    # Load embedding model
    print(f"\nLoading embedding model: {EMBEDDING_MODEL_NAME}")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print("  Model loaded.")

    # Run import
    stats = run_import(candidates, model, dry_run=args.dry_run)

    # Print summary
    print()
    print("=" * 60)
    print("IMPORT SUMMARY")
    print("=" * 60)
    print(f"  Inserted (new documents)      : {stats['inserted']}")
    print(f"  Updated  (existing documents) : {stats['updated']}")
    print(f"  Skipped  (exact duplicates)   : {stats['skipped_exact_duplicate']}")
    print(f"  Errors   (invalid/incomplete) : {stats['errors']}")
    if args.dry_run:
        print()
        print("  (Dry run — no changes were made to MongoDB)")
    else:
        print()
        print("  Done! Unverified documents are visible in:")
        print("  Admin Dashboard > Knowledge Base > filter 'Unverified'")
    print("=" * 60)


if __name__ == "__main__":
    main()
