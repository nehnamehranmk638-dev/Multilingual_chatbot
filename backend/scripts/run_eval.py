import sys, os
sys.path.append(r'C:\Documents\projects\Multilingual_chatbot\backend')
from chatbot.language import detect_and_translate

ml_tests = [
    'BTech admission eppol thudangum',
    'CSE fee ethra aanu',
    'Hostel facility engane undu',
    'Campus il evide aanu library',
    'Application form submit cheyyan enthu cheyyanam',
    'Food nalla reethiyil kittumo',
]

ta_tests = [
    'BTech admission eppo start aagum',
    'CSE fee evlo aagum',
    'Hostel facility epdi irukku',
    'Campus la enga library irukku',
    'Application form submit panna enna pannanum',
    'Food nalla irukkuma',
]

print('=== MALAYALAM (MANGLISH) TESTS ===')
for q in ml_tests:
    r = detect_and_translate(q)
    lang = r.get('language_code')
    eng = r.get('english_translation')
    status = 'PASS' if lang == 'ml' else 'FAIL'
    print(f'[{status}] Detected: {lang} | Query: {q} | Translation: {eng}')

print('\n=== TAMIL (TANGLISH) TESTS ===')
for q in ta_tests:
    r = detect_and_translate(q)
    lang = r.get('language_code')
    eng = r.get('english_translation')
    status = 'PASS' if lang == 'ta' else 'FAIL'
    print(f'[{status}] Detected: {lang} | Query: {q} | Translation: {eng}')
