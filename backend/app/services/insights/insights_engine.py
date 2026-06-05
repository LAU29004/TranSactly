
def generate_insights(transactions):

    insights = []

    total_spending = 0

    for tx in transactions:

        if tx.get("type") == "debit":
            total_spending += tx.get("amount", 0)

    insights.append(
        f"Total spending detected: ₹{total_spending}"
    )

    return insights