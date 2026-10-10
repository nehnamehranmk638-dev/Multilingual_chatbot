"""
Test script for LLM-based language detection + translation.

Tests all 6 supported languages across native script,
romanized, and code-switched forms.

Usage:
    cd backend
    python -m scripts.test_language_detection
"""

import sys
import os

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add parent dir so we can import chatbot modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE", "backend.settings"
)

from chatbot.language import detect_and_translate


# --------------------------------------------------
# Test cases: 3+ per language × 6 languages = 18+
# Plus edge cases
# --------------------------------------------------

TEST_CASES = [

    # ==============================================
    # ENGLISH
    # ==============================================
    {
        "input": "What is the B.Tech fee structure?",
        "expected_lang": "en",
        "expected_romanized": False,
        "description": "English — plain question",
    },
    {
        "input": "How to apply for admission in IIIT Kottayam?",
        "expected_lang": "en",
        "expected_romanized": False,
        "description": "English — admission query",
    },
    {
        "input": "What is the hostel fee?",
        "expected_lang": "en",
        "expected_romanized": False,
        "description": "English — hostel query",
    },

    # ==============================================
    # HINDI — Native Script
    # ==============================================
    {
        "input": "बीटेक की फीस कितनी है?",
        "expected_lang": "hi",
        "expected_romanized": False,
        "description": "Hindi native — B.Tech fee",
    },
    {
        "input": "प्रवेश प्रक्रिया क्या है?",
        "expected_lang": "hi",
        "expected_romanized": False,
        "description": "Hindi native — admission process",
    },
    {
        "input": "हॉस्टल में कितना खर्चा आता है?",
        "expected_lang": "hi",
        "expected_romanized": False,
        "description": "Hindi native — hostel cost",
    },

    # ==============================================
    # HINDI — Romanized (Hinglish)
    # ==============================================
    {
        "input": "btech ki fees kitni hai",
        "expected_lang": "hi",
        "expected_romanized": True,
        "description": "Hinglish — B.Tech fee",
    },
    {
        "input": "admission ke liye kya karna padega",
        "expected_lang": "hi",
        "expected_romanized": True,
        "description": "Hinglish — admission process",
    },
    {
        "input": "CSE me kitne seats hain",
        "expected_lang": "hi",
        "expected_romanized": True,
        "description": "Hinglish — code-switched with CSE",
    },

    # ==============================================
    # MALAYALAM — Native Script
    # ==============================================
    {
        "input": "ബിടെക് ഫീസ് എത്രയാണ്?",
        "expected_lang": "ml",
        "expected_romanized": False,
        "description": "Malayalam native — B.Tech fee",
    },
    {
        "input": "അഡ്മിഷൻ പ്രക്രിയ എന്താണ്?",
        "expected_lang": "ml",
        "expected_romanized": False,
        "description": "Malayalam native — admission process",
    },
    {
        "input": "ഹോസ്റ്റൽ ഫീസ് എത്രയാണ്?",
        "expected_lang": "ml",
        "expected_romanized": False,
        "description": "Malayalam native — hostel fee",
    },

    # ==============================================
    # MALAYALAM — Romanized (Manglish)
    # ==============================================
    {
        "input": "CSE fee ethra aanu",
        "expected_lang": "ml",
        "expected_romanized": True,
        "description": "Manglish — CSE fee (code-switched)",
    },
    {
        "input": "admission process entha",
        "expected_lang": "ml",
        "expected_romanized": True,
        "description": "Manglish — admission process",
    },
    {
        "input": "hostel il ethra per und",
        "expected_lang": "ml",
        "expected_romanized": True,
        "description": "Manglish — hostel occupancy",
    },

    # ==============================================
    # TAMIL — Native Script
    # ==============================================
    {
        "input": "பி.டெக் கட்டணம் என்ன?",
        "expected_lang": "ta",
        "expected_romanized": False,
        "description": "Tamil native — B.Tech fee",
    },
    {
        "input": "சேர்க்கை நடைமுறை என்ன?",
        "expected_lang": "ta",
        "expected_romanized": False,
        "description": "Tamil native — admission process",
    },
    {
        "input": "விடுதி கட்டணம் எவ்வளவு?",
        "expected_lang": "ta",
        "expected_romanized": False,
        "description": "Tamil native — hostel fee",
    },

    # ==============================================
    # TAMIL — Romanized (Tanglish)
    # ==============================================
    {
        "input": "admission process enna",
        "expected_lang": "ta",
        "expected_romanized": True,
        "description": "Tanglish — admission process",
    },
    {
        "input": "CSE la ethana seats iruku",
        "expected_lang": "ta",
        "expected_romanized": True,
        "description": "Tanglish — CSE seats (code-switched)",
    },
    {
        "input": "btech fees evvalavu",
        "expected_lang": "ta",
        "expected_romanized": True,
        "description": "Tanglish — B.Tech fee",
    },

    # ==============================================
    # TELUGU — Native Script
    # ==============================================
    {
        "input": "బి.టెక్ ఫీజు ఎంత?",
        "expected_lang": "te",
        "expected_romanized": False,
        "description": "Telugu native — B.Tech fee",
    },
    {
        "input": "అడ్మిషన్ ప్రక్రియ ఏమిటి?",
        "expected_lang": "te",
        "expected_romanized": False,
        "description": "Telugu native — admission process",
    },
    {
        "input": "హాస్టల్ ఫీజు ఎంత?",
        "expected_lang": "te",
        "expected_romanized": False,
        "description": "Telugu native — hostel fee",
    },

    # ==============================================
    # TELUGU — Romanized (Tenglish)
    # ==============================================
    {
        "input": "fee structure enti",
        "expected_lang": "te",
        "expected_romanized": True,
        "description": "Tenglish — fee structure",
    },
    {
        "input": "admission ki em cheyali",
        "expected_lang": "te",
        "expected_romanized": True,
        "description": "Tenglish — admission process",
    },
    {
        "input": "CSE lo seats enni unnai",
        "expected_lang": "te",
        "expected_romanized": True,
        "description": "Tenglish — CSE seats (code-switched)",
    },

    # ==============================================
    # KANNADA — Native Script
    # ==============================================
    {
        "input": "ಬಿ.ಟೆಕ್ ಶುಲ್ಕ ಎಷ್ಟು?",
        "expected_lang": "kn",
        "expected_romanized": False,
        "description": "Kannada native — B.Tech fee",
    },
    {
        "input": "ಪ್ರವೇಶ ಪ್ರಕ್ರಿಯೆ ಏನು?",
        "expected_lang": "kn",
        "expected_romanized": False,
        "description": "Kannada native — admission process",
    },
    {
        "input": "ಹಾಸ್ಟೆಲ್ ಶುಲ್ಕ ಎಷ್ಟು?",
        "expected_lang": "kn",
        "expected_romanized": False,
        "description": "Kannada native — hostel fee",
    },

    # ==============================================
    # KANNADA — Romanized (Kanglish)
    # ==============================================
    {
        "input": "admission hege apply maadodu",
        "expected_lang": "kn",
        "expected_romanized": True,
        "description": "Kanglish — admission apply",
    },
    {
        "input": "CSE fee eshtu",
        "expected_lang": "kn",
        "expected_romanized": True,
        "description": "Kanglish — CSE fee (code-switched)",
    },
    {
        "input": "hostel facility ide aa",
        "expected_lang": "kn",
        "expected_romanized": True,
        "description": "Kanglish — hostel facility",
    },

    # ==============================================
    # EDGE CASES — Ambiguous / Tricky
    # ==============================================
    {
        "input": "fee?",
        "expected_lang": "en",
        "expected_romanized": False,
        "description": "EDGE — single English word",
    },
    {
        "input": "hostel?",
        "expected_lang": "en",
        "expected_romanized": False,
        "description": "EDGE — single English word",
    },
    {
        "input": "CSE",
        "expected_lang": "en",
        "expected_romanized": False,
        "description": "EDGE — single acronym",
    },
    {
        "input": "njan CSE edukkanam",
        "expected_lang": "ml",
        "expected_romanized": True,
        "description": "EDGE — Manglish with 'njan' (I)",
    },
    {
        "input": "mujhe admission chahiye",
        "expected_lang": "hi",
        "expected_romanized": True,
        "description": "EDGE — Hinglish 'I want admission'",
    },
]


def main():

    print("=" * 70)
    print("  LANGUAGE DETECTION + TRANSLATION TEST")
    print(f"  Total test cases: {len(TEST_CASES)}")
    print("=" * 70)

    passed = 0
    failed = 0

    for i, case in enumerate(TEST_CASES, 1):

        print(f"\n--- Test {i}/{len(TEST_CASES)} ---")
        print(f"  Description : {case['description']}")
        print(f"  Input       : {case['input']}")

        result = detect_and_translate(case["input"])

        lang_ok = (
            result["language_code"]
            == case["expected_lang"]
        )
        rom_ok = (
            result["is_romanized"]
            == case["expected_romanized"]
        )

        status = "✓ PASS" if (lang_ok and rom_ok) else "✗ FAIL"

        if lang_ok and rom_ok:
            passed += 1
        else:
            failed += 1

        print(
            f"  Detected    : {result['language_code']}"
            f"  (expected: {case['expected_lang']})"
            f"  {'✓' if lang_ok else '✗'}"
        )
        print(
            f"  Romanized   : {result['is_romanized']}"
            f"  (expected: {case['expected_romanized']})"
            f"  {'✓' if rom_ok else '✗'}"
        )
        print(
            f"  Translation : {result['english_translation']}"
        )
        print(f"  Result      : {status}")

    print("\n" + "=" * 70)
    print(f"  RESULTS: {passed} passed, {failed} failed"
          f" out of {len(TEST_CASES)}")
    print("=" * 70)


if __name__ == "__main__":
    main()
