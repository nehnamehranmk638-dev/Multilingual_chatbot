from pathlib import Path
from docx import Document


DOCUMENT_PATH = (
    Path(__file__).resolve().parents[2]
    / "knowledge_base"
    / "iiitk_knowledge_base.docx"
)


def extract_sections():
    document = Document(DOCUMENT_PATH)

    sections = []
    current_title = None
    current_content = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if not text:
            continue

        # Detect section headings such as:
        # 1. Purpose and Scope
        # 2. Website Coverage
        # 3. Institute Profile
        if len(text) > 2 and text[0].isdigit() and "." in text[:4]:
            # Save previous section
            if current_title and current_content:
                sections.append({
                    "title": current_title,
                    "content": "\n".join(current_content)
                })

            current_title = text
            current_content = []

        else:
            current_content.append(text)

    # Save final section
    if current_title and current_content:
        sections.append({
            "title": current_title,
            "content": "\n".join(current_content)
        })

    return sections


if __name__ == "__main__":
    sections = extract_sections()

    print(f"Extracted {len(sections)} sections.\n")

    for i, section in enumerate(sections, start=1):
        print("=" * 60)
        print(f"SECTION {i}: {section['title']}")
        print("=" * 60)
        print(section["content"][:500])
        print()