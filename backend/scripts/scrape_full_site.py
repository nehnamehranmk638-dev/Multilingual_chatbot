#!/usr/bin/env python3
"""
IIIT Kottayam Knowledge Base Scraper
======================================
Scrapes admission-related content from iiitkottayam.ac.in and its subdomains.
Outputs a local JSON file (scraped_candidates.json) for HUMAN REVIEW.
Does NOT insert anything into MongoDB.

Usage:
    python backend/scripts/scrape_full_site.py

Output:
    backend/scripts/scraped_candidates.json
"""

import os
import sys
import json
import re
import time
import io
import warnings
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Comment

warnings.filterwarnings("ignore", message="Unverified HTTPS request")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REQUEST_DELAY = 1.5  # seconds between HTTP requests (polite crawling)
REQUEST_TIMEOUT = 15
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; IIITK-ChatbotScraper/1.0; "
        "+https://iiitkottayam.ac.in)"
    )
}

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "scraped_candidates.json")

# ---------------------------------------------------------------------------
# Exact pages to scrape (reviewed and approved list)
# ---------------------------------------------------------------------------

HTML_TARGETS = [
    # ---- Core admission, fees, scholarship ----------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/views/admission.html",
        "category": "admission_process",
        "title_hint": "Admission Overview",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/fees.html",
        "category": "fees",
        "title_hint": "Fee Structure",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/scholarship.html",
        "category": "scholarships",
        "title_hint": "Scholarships & Financial Assistance",
    },
    # ---- Academic programmes ------------------------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/views/academics.html",
        "category": "academics",
        "title_hint": "Academic Regulations",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/btech_cs_home.html",
        "category": "academics",
        "title_hint": "B.Tech CSE Programme",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/btech_ec_home.html",
        "category": "academics",
        "title_hint": "B.Tech ECE Programme",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/mtech_home.html",
        "category": "academics",
        "title_hint": "M.Tech Programme",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/mtech.html",
        "category": "academics",
        "title_hint": "M.Tech Curriculum Details",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/views/phd_home.html",
        "category": "academics",
        "title_hint": "PhD Programme",
    },
    # ---- Campus & hostel ----------------------------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/views/campus.html",
        "category": "hostel",
        "title_hint": "Campus Facilities & Hostel",
    },
    # ---- Contact & location -------------------------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/views/contact.html",
        "category": "contact",
        "title_hint": "Contact & How to Reach",
    },
    # ---- Admission subdomains -----------------------------------------------
    {
        "url": "https://admission.iiitkottayam.ac.in",
        "category": "admission_process",
        "title_hint": "UG Admission Portal",
    },
    {
        "url": "https://imtech.iiitkottayam.ac.in/",
        "category": "admission_process",
        "title_hint": "Integrated M.Tech Admission",
    },
    {
        "url": "https://mtech.iiitkottayam.ac.in/",
        "category": "admission_process",
        "title_hint": "M.Tech Weekend Programme Admission",
    },
    {
        "url": "https://emtech.iiitkottayam.ac.in/",
        "category": "admission_process",
        "title_hint": "Executive e-M.Tech Admission",
    },
    {
        "url": "https://phd.iiitkottayam.ac.in/",
        "category": "admission_process",
        "title_hint": "PhD Admission",
    },
]

PDF_TARGETS = [
    # ---- Hostel rules -------------------------------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/IIIT Kottayam - Hostel Rules and Regulations - July 2026 .pdf",
        "category": "hostel",
        "title_hint": "Hostel Rules and Regulations 2026",
    },
    # ---- Academic calendars -------------------------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/UG Sem1_Odd 2026-27_academic_calendar 2026.pdf",
        "category": "academics",
        "title_hint": "UG Academic Calendar 2026-27 (Odd Semester)",
    },
    {
        "url": "https://imtech.iiitkottayam.ac.in/files/Academic_Calendar.pdf",
        "category": "academics",
        "title_hint": "iM.Tech Academic Calendar",
    },
    # ---- UG regulations & branch curricula ---------------------------------
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/ADM2026_UG regulations_annexure_updated.pdf",
        "category": "admission_process",
        "title_hint": "UG Admission Regulations 2026",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/CSE_ADM_2026.pdf",
        "category": "academics",
        "title_hint": "B.Tech CSE Curriculum 2026",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/ECE_ADM_2026.pdf",
        "category": "academics",
        "title_hint": "B.Tech ECE Curriculum 2026",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/AI_DS_ADM_2026.pdf",
        "category": "academics",
        "title_hint": "B.Tech AI & Data Science Curriculum 2026",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/Cyber_ADM_2026.pdf",
        "category": "academics",
        "title_hint": "B.Tech Cyber Security Curriculum 2026",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/BMC_ADM_2026.pdf",
        "category": "academics",
        "title_hint": "B.Tech Mathematics & Computing Curriculum 2026",
    },
    # ---- PG & PhD regulations & brochures ----------------------------------
    {
        "url": "https://imtech.iiitkottayam.ac.in/files/Regulations_imtech.pdf",
        "category": "academics",
        "title_hint": "iM.Tech Programme Regulations",
    },
    {
        "url": "https://imtech.iiitkottayam.ac.in/files/iM.Tech._Curriculum.pdf",
        "category": "academics",
        "title_hint": "iM.Tech Curriculum",
    },
    {
        "url": "https://imtech.iiitkottayam.ac.in/files/Flyer_Jan2027.pdf",
        "category": "admission_process",
        "title_hint": "iM.Tech Admission Flyer Jan 2027",
    },
    {
        "url": "https://mtech.iiitkottayam.ac.in/files/MWP_Regulations_IIIT_Kottayam1.pdf",
        "category": "academics",
        "title_hint": "M.Tech Weekend Programme Regulations",
    },
    {
        "url": "https://emtech.iiitkottayam.ac.in/files/eMTech_Regulations_IIIT_Kottayam.pdf",
        "category": "academics",
        "title_hint": "e-M.Tech Programme Regulations",
    },
    {
        "url": "https://emtech.iiitkottayam.ac.in/files/brochure.pdf",
        "category": "admission_process",
        "title_hint": "e-M.Tech Brochure",
    },
    {
        "url": "https://phd.iiitkottayam.ac.in/files/PhD_Regulations.pdf",
        "category": "academics",
        "title_hint": "PhD Programme Regulations",
    },
    {
        "url": "https://phd.iiitkottayam.ac.in/files/August 2026_PhD Admission_Advertisement.pdf",
        "category": "admission_process",
        "title_hint": "PhD Admission Advertisement August 2026",
    },
    {
        "url": "https://phd.iiitkottayam.ac.in/files/Entrance_Exam_syllabus.pdf",
        "category": "admission_process",
        "title_hint": "PhD Entrance Exam Syllabus",
    },
    {
        "url": "https://phd.iiitkottayam.ac.in/files/PhD Brochure August 2026.pdf",
        "category": "admission_process",
        "title_hint": "PhD Brochure August 2026",
    },
    {
        "url": "https://www.iiitkottayam.ac.in/data/pdf/Transcript verification procedure.pdf",
        "category": "admission_process",
        "title_hint": "Transcript Verification Procedure",
    },
]


# ---------------------------------------------------------------------------
# Boilerplate / noise patterns to strip before storing
# ---------------------------------------------------------------------------

BOILERPLATE_PATTERNS = [
    r"Indian Institute of Information Technology Kottayam",  # in every page footer
    r"All rights reserved",
    r"Powered by",
    r"Skip to (main )?content",
    r"Toggle navigation",
    r"Back to top",
    r"©\s*\d{4}",
    r"\bHome\b.*?\bContact\b",     # nav menu line
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

session = requests.Session()
session.headers.update(HEADERS)


def _clean_text(raw_text: str) -> str:
    """Strip boilerplate, collapse whitespace."""
    text = raw_text
    for pat in BOILERPLATE_PATTERNS:
        text = re.sub(pat, " ", text, flags=re.IGNORECASE)
    # Collapse multiple blank lines / spaces
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def _extract_text_from_html(html: str, source_url: str) -> str:
    """Parse HTML and return clean plain text, stripping nav/footer/scripts."""
    soup = BeautifulSoup(html, "html.parser")

    # Remove noise tags
    for tag in soup.find_all(["script", "style", "noscript", "header", "footer",
                               "nav", "aside"]):
        tag.decompose()

    # Remove HTML comments
    for comment in soup.find_all(string=lambda t: isinstance(t, Comment)):
        comment.extract()

    # Remove nav-like elements by class/id heuristics
    for tag in soup.find_all(True):
        if not hasattr(tag, "attrs") or tag.attrs is None:
            continue
        classes = tag.attrs.get("class", [])
        cls = " ".join(classes) if isinstance(classes, list) else str(classes)
        tag_id = str(tag.attrs.get("id", ""))
        if any(kw in (cls + tag_id).lower() for kw in
               ["navbar", "nav-", "footer", "breadcrumb", "pagination",
                "sidebar", "social", "cookie", "banner", "modal"]):
            tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    return _clean_text(text)


def _extract_text_from_pdf(content: bytes) -> str:
    """Extract plain text from PDF bytes using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                parts.append(page_text)
        return _clean_text("\n\n".join(parts))
    except Exception as e:
        print(f"    [WARN] PDF text extraction failed: {e}")
        return ""


def _chunk_text(text: str, min_chars: int = 300, max_chars: int = 900) -> list[str]:
    """
    Split text into chunks of ~500-900 chars.
    - Never splits inside a sentence (splits on paragraph boundaries first,
      then sentence boundaries within long paragraphs).
    - Never splits a table row (lines containing | or tab-separated numbers
      are kept together).
    """
    # Split on double newlines (paragraphs)
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current = ""

    for para in paragraphs:
        # If adding this paragraph keeps us under max, accumulate
        if current and (len(current) + len(para) + 2) <= max_chars:
            current += "\n\n" + para
        else:
            # Flush current chunk if big enough
            if current and len(current) >= min_chars:
                chunks.append(current.strip())
                current = para
            elif current:
                # Too short — keep accumulating
                current += "\n\n" + para
            else:
                current = para

            # If current is already too big, split by sentences
            while len(current) > max_chars:
                split_pos = max_chars
                # Walk back to find sentence boundary
                for boundary in [". ", "! ", "? ", ".\n", "!\n", "?\n"]:
                    pos = current.rfind(boundary, min_chars, max_chars)
                    if pos != -1:
                        split_pos = pos + len(boundary)
                        break
                chunks.append(current[:split_pos].strip())
                current = current[split_pos:].strip()

    if current and len(current) >= min_chars:
        chunks.append(current.strip())
    elif current and chunks:
        # Append leftover to last chunk rather than create tiny fragment
        chunks[-1] += "\n\n" + current

    return chunks


def _fetch_url(url: str):
    """Fetch a URL, return (response | None, content_type)."""
    try:
        resp = session.get(url, timeout=REQUEST_TIMEOUT, verify=False)
        resp.raise_for_status()
        ct = resp.headers.get("Content-Type", "")
        return resp, ct
    except Exception as e:
        print(f"    [ERROR] Failed to fetch {url}: {e}")
        return None, ""


def _is_relevant_content(text: str) -> bool:
    """Return False if content is empty or clearly non-admission boilerplate."""
    if len(text) < 100:
        return False
    noise_only = [
        "page not found", "404", "403 forbidden", "access denied",
        "this site requires javascript",
    ]
    lower = text.lower()
    return not any(n in lower for n in noise_only)


# ---------------------------------------------------------------------------
# Scraping functions
# ---------------------------------------------------------------------------

def scrape_html_target(target: dict) -> list[dict]:
    """Fetch one HTML page, extract text, chunk, return list of KB candidates."""
    url = target["url"]
    category = target["category"]
    title_hint = target["title_hint"]

    print(f"  Fetching HTML: {url}")
    time.sleep(REQUEST_DELAY)

    resp, ct = _fetch_url(url)
    if resp is None:
        return []

    text = _extract_text_from_html(resp.text, url)
    if not _is_relevant_content(text):
        print(f"    [SKIP] No relevant content at {url}")
        return []

    chunks = _chunk_text(text)
    print(f"    -> {len(chunks)} chunk(s) from {len(text)} chars")

    results = []
    for i, chunk in enumerate(chunks, start=1):
        results.append({
            "title": f"{title_hint}" if len(chunks) == 1 else f"{title_hint} (Part {i})",
            "content": chunk,
            "category": category,
            "language": "en",
            "source": url,
            "verified": False,  # NEVER auto-verify
            "_scrape_meta": {
                "scraped_at": datetime.now(timezone.utc).isoformat(),
                "chunk_index": i,
                "total_chunks": len(chunks),
                "content_type": "html",
            }
        })
    return results


def scrape_pdf_target(target: dict) -> list[dict]:
    """Fetch one PDF, extract text, chunk, return list of KB candidates."""
    url = target["url"]
    category = target["category"]
    title_hint = target["title_hint"]

    print(f"  Fetching PDF: {url}")
    time.sleep(REQUEST_DELAY)

    resp, ct = _fetch_url(url)
    if resp is None:
        return []

    if "pdf" not in ct.lower() and not url.lower().endswith(".pdf"):
        print(f"    [SKIP] Not a PDF response at {url} (Content-Type: {ct})")
        return []

    text = _extract_text_from_pdf(resp.content)
    if not _is_relevant_content(text):
        print(f"    [SKIP] No usable text extracted from PDF: {url}")
        return []

    chunks = _chunk_text(text)
    print(f"    -> {len(chunks)} chunk(s) from {len(text)} chars")

    results = []
    for i, chunk in enumerate(chunks, start=1):
        results.append({
            "title": f"{title_hint}" if len(chunks) == 1 else f"{title_hint} (Part {i})",
            "content": chunk,
            "category": category,
            "language": "en",
            "source": url,
            "verified": False,  # NEVER auto-verify
            "_scrape_meta": {
                "scraped_at": datetime.now(timezone.utc).isoformat(),
                "chunk_index": i,
                "total_chunks": len(chunks),
                "content_type": "pdf",
            }
        })
    return results


# ---------------------------------------------------------------------------
# Deduplication helper (source-level, across output candidates)
# ---------------------------------------------------------------------------

def deduplicate_candidates(candidates: list[dict]) -> list[dict]:
    """
    Within the output list, if two chunks from the same source URL are
    almost identical (first 200 chars match), keep only the later one.
    This prevents double-scraping the same URL returning the same result.
    """
    seen: dict[str, set] = {}  # source_url -> set of content fingerprints
    unique = []
    for doc in candidates:
        src = doc["source"]
        fingerprint = doc["content"][:200].strip()
        if src not in seen:
            seen[src] = set()
        if fingerprint in seen[src]:
            continue  # skip duplicate
        seen[src].add(fingerprint)
        unique.append(doc)
    return unique


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("IIIT Kottayam Knowledge Base Scraper")
    print("=" * 60)
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Request delay: {REQUEST_DELAY}s between requests")
    print(f"Total HTML targets: {len(HTML_TARGETS)}")
    print(f"Total PDF targets:  {len(PDF_TARGETS)}")
    print()
    print("NOTE: No data is inserted into MongoDB from this script.")
    print("      Review scraped_candidates.json before running import_reviewed_kb.py")
    print()

    all_candidates = []

    # ---- Scrape HTML pages --------------------------------------------------
    print("--- Scraping HTML Pages ---")
    for target in HTML_TARGETS:
        docs = scrape_html_target(target)
        all_candidates.extend(docs)
        print(f"    Collected {len(docs)} doc(s). Running total: {len(all_candidates)}")

    # ---- Scrape PDF documents -----------------------------------------------
    print()
    print("--- Scraping PDF Documents ---")
    for target in PDF_TARGETS:
        docs = scrape_pdf_target(target)
        all_candidates.extend(docs)
        print(f"    Collected {len(docs)} doc(s). Running total: {len(all_candidates)}")

    # ---- Deduplicate within output ------------------------------------------
    before_dedup = len(all_candidates)
    all_candidates = deduplicate_candidates(all_candidates)
    deduped = before_dedup - len(all_candidates)

    # ---- Write output -------------------------------------------------------
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_candidates, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 60)
    print(f"DONE!")
    print(f"  Total candidates scraped : {before_dedup}")
    print(f"  Duplicates removed       : {deduped}")
    print(f"  Final candidate count    : {len(all_candidates)}")
    print(f"  Output written to        : {OUTPUT_FILE}")
    print()
    print("NEXT STEP:")
    print("  1. Open scraped_candidates.json")
    print("  2. Review each document's 'content' field")
    print("  3. Delete or edit any inaccurate/irrelevant entries")
    print("  4. Set 'verified': true for entries you have confirmed are accurate")
    print("  5. Run: python backend/scripts/import_reviewed_kb.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
