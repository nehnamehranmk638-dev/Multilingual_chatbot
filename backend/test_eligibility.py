from chatbot.eligibility import check_eligibility


tests = [
    (10000, "general"),
    (20000, "obc"),
    (50000, "sc"),
    (70000, "st"),
]


for rank, category in tests:

    result = check_eligibility(
        rank,
        category
    )

    print("\n--------------------")
    print(f"Rank: {rank}")
    print(f"Category: {category}")
    print(result)