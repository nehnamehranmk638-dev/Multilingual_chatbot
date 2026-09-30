from chatbot.agent import classify_intent


questions = [
    "What is the B.Tech fee?",
    "What documents are required?",
    "What is the hostel fee?",
    "My JEE rank is 20000 and I am OBC, which branches can I get?",
    "I got rank 15000 in JEE Main, can I get CSE?"
]


for question in questions:

    result = classify_intent(question)

    print("\nQuestion:")
    print(question)

    print("Intent:")
    print(result)