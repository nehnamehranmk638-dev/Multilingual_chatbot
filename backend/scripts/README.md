# IIIT Kottayam Knowledge Base Ingestion Pipeline

Welcome! This guide explains how to gather verified admission information from the official IIIT Kottayam website and import it safely into our chatbot's Knowledge Base.

---

## 🎯 How the Pipeline Works

To keep the chatbot 100% accurate and prevent incorrect answers, the process has **3 simple steps**:

```
[Official Website & PDFs]
          │
          ▼  Step 1: Run Scraper
[scraped_candidates.json]  (Stored safely on your computer)
          │
          ▼  Step 2: Human Review & Approval
(You or staff review text, fix typos, set "verified": true)
          │
          ▼  Step 3: Run Importer
[MongoDB Knowledge Base]  (Ready for Chatbot & Admin Dashboard)
```

---

## 🚀 Step 1: Run the Web Scraper

This script downloads admission pages and official PDFs from `iiitkottayam.ac.in` and extracts clean, readable text into small chunks.

> **Note:** This script does **NOT** touch the database. It only saves a file named `scraped_candidates.json`.

1. Open PowerShell / Terminal.
2. Go to the `backend` folder and activate the virtual environment:
   ```powershell
   cd C:\Documents\projects\Multilingual_chatbot\backend
   venv\Scripts\activate
   ```
3. Run the scraper:
   ```powershell
   python scripts/scrape_full_site.py
   ```
4. You will see progress messages as pages and PDFs are scraped. Once finished, a file named `scraped_candidates.json` will appear in `backend/scripts/`.

---

## 📝 Step 2: Human Review & Approval

Open `backend/scripts/scraped_candidates.json` in VS Code or any text editor.

Each item in this file looks like this:
```json
{
  "title": "Fee Structure (Part 1)",
  "content": "Tuition Fee: ₹1,59,800 per semester. Hostel maintenance: ₹37,500...",
  "category": "fees",
  "language": "en",
  "source": "https://www.iiitkottayam.ac.in/views/fees.html",
  "verified": false
}
```

### What you should check:
1. **Content Accuracy:** Does the text read clearly? Is it genuinely about admissions, fees, hostels, or courses?
2. **Remove Garbage:** If any chunk contains navigation menus or irrelevant text, you can delete that entire `{ ... }` block.
3. **Approval:**
   - If you (or admission staff) have confirmed that the content is accurate and official, change:
     ```json
     "verified": true
     ```
   - If you want staff to review it later through the web dashboard, leave it as:
     ```json
     "verified": false
     ```
4. Save the file (`Ctrl + S`).

---

## 📥 Step 3: Import into the Knowledge Base

Once your JSON file is reviewed, run the import script. This computes AI embeddings and safely inserts or updates documents in MongoDB.

### Option A: Preview first (Dry Run - No database changes)
To test and see what would happen without making any changes to the database:
```powershell
python scripts/import_reviewed_kb.py --dry-run
```

### Option B: Actual Import
When ready, run:
```powershell
python scripts/import_reviewed_kb.py
```

The script will show a summary:
- **Inserted:** New documents added.
- **Updated:** Existing documents updated (preserving any previously verified status).
- **Skipped:** Exact duplicates that are already in the database.

---

## 🔍 Step 4: Reviewing in the Admin Portal

1. Start the Django backend and Vite frontend:
   - Backend: `python manage.py runserver`
   - Frontend: `npm run dev`
2. Go to `http://localhost:5173/admin/login` and log in with your admin credentials.
3. Click on the **📚 Knowledge Base** tab.
4. Use the **Status dropdown filter** at the top right:
   - Select **"Unverified (Pending Review)"** to see all newly scraped items that need human approval.
   - Click **Edit**, review the text, check the **"Verified Official Document"** checkbox, and click **Save Document**!
