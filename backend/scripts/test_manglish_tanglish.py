import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from chatbot.language import detect_and_translate

test_phrases = [
    # Malayalam (Manglish)
    ('ml', 'CSE fee ethra aanu'),
    ('ml', 'Hostel facility engane undu'),
    ('ml', 'BTech admission eppol thudangum'),
    ('ml', 'Campus il evide aanu library'),
    ('ml', 'Application form submit cheyyan enthu cheyyanam'),
    ('ml', 'Food nalla reethiyil kittumo'),
    # Tamil (Tanglish)
    ('ta', 'CSE fee evlo aagum'),
    ('ta', 'Hostel facility epdi irukku'),
    ('ta', 'BTech admission eppo start aagum'),
    ('ta', 'Campus la enga library irukku'),
    ('ta', 'Application form submit panna enna pannanum'),
    ('ta', 'Food nalla irukkuma'),
]

print('Current detect_and_translate results:')
for expected, phrase in test_phrases:
    res = detect_and_translate(phrase)
    detected = res.get('language_code')
    status = 'PASS' if detected == expected else 'FAIL'
    print(f'[{status}] Expected: {expected} | Detected: {detected} | Phrase: "{phrase}"')
