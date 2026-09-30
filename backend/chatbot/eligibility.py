def check_eligibility(rank, category):
    """
    Temporary eligibility checker for development.

    IMPORTANT:
    These cutoff values are placeholders.
    They must be replaced with verified official
    IIITK cutoff data before using this in a demo.
    """

    cutoffs = {
        "general": 15000,
        "obc": 22000,
        "sc": 45000,
        "st": 60000,
    }

    category = category.lower()

    if category not in cutoffs:
        return {
            "status": "error",
            "message": "Category not supported."
        }

    cutoff = cutoffs[category]

    if rank <= cutoff:
        return {
            "status": "eligible",
            "category": category,
            "rank": rank,
            "cutoff": cutoff,
            "message": (
                f"Your rank {rank} is within the "
                f"placeholder cutoff of {cutoff} for {category.upper()}."
            )
        }

    return {
        "status": "not_eligible",
        "category": category,
        "rank": rank,
        "cutoff": cutoff,
        "message": (
            f"Your rank {rank} is outside the "
            f"placeholder cutoff of {cutoff} for {category.upper()}."
        )
    }