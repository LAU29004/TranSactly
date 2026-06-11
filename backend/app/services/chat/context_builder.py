from sqlalchemy import func

from app.models.transaction import Transaction


def build_financial_snapshot(    db,
    user_id: int):

    # ----------------------------------------
    # Income
    # ----------------------------------------

    income = (
        db.query(
            func.sum(Transaction.amount)
        )
        .filter(
    Transaction.user_id == user_id
)
        .filter(
            Transaction.category == "Income"
        )
        .scalar()
        or 0
    )

    # ----------------------------------------
    # Expenses
    # ----------------------------------------

    expenses = (
        db.query(
            func.sum(Transaction.amount)
        )
        .filter(
    Transaction.user_id == user_id
)
        .filter(
            Transaction.type == "debit"
        )
        .filter(
            Transaction.category != "Transfer"
        )
        .scalar()
        or 0
    )

    # ----------------------------------------
    # Savings
    # ----------------------------------------

    savings = income - expenses

    # ----------------------------------------
    # Transaction Count
    # ----------------------------------------

    transaction_count = (
        db.query(Transaction)
        .count()
    )

    # ----------------------------------------
    # Top Category
    # ----------------------------------------

    top_category = (
        db.query(
            Transaction.category,
            func.sum(Transaction.amount),
        )
        .filter(
    Transaction.user_id == user_id
)
        .filter(
            Transaction.type == "debit"
        )
        .filter(
            Transaction.category != "Transfer"
        )
        .group_by(
            Transaction.category
        )
        .order_by(
            func.sum(
                Transaction.amount
            ).desc()
        )
        .first()
    )

    # ----------------------------------------
    # Top Merchant
    # ----------------------------------------

    top_merchant = (
        db.query(
            Transaction.merchant,
            func.sum(Transaction.amount),
        )
        .filter(
    Transaction.user_id == user_id
)
        .filter(
            Transaction.type == "debit"
        )
        .filter(
            Transaction.category != "Transfer"
        )
        .filter(
            Transaction.merchant != "Unknown"
        )
        .group_by(
            Transaction.merchant
        )
        .order_by(
            func.sum(
                Transaction.amount
            ).desc()
        )
        .first()
    )

    return {

        "income": round(
            float(income),
            2,
        ),

        "expenses": round(
            float(expenses),
            2,
        ),

        "savings": round(
            float(savings),
            2,
        ),

        "transaction_count":
        transaction_count,

        "top_category":
        top_category,

        "top_merchant":
        top_merchant,
    }


def build_financial_context(    db,
    user_id: int,):

    snapshot = (
        build_financial_snapshot(
                   db,
        user_id,
        )
    )

    # ----------------------------------------
    # Category Breakdown
    # ----------------------------------------

    categories = (
        db.query(
            Transaction.category,
            func.sum(
                Transaction.amount
            ),
        )
        .filter(
    Transaction.user_id == user_id
)
        .filter(
            Transaction.type == "debit"
        )
        .filter(
            Transaction.category != "Transfer"
        )
        .group_by(
            Transaction.category
        )
        .order_by(
            func.sum(
                Transaction.amount
            ).desc()
        )
        .all()
    )
    # ----------------------------------------
    # Top 3 Categories
    # ----------------------------------------

    top_categories = categories[:3]

    # ----------------------------------------
    # Top Merchants
    # ----------------------------------------

    merchants = (
        db.query(
            Transaction.merchant,
            func.sum(
                Transaction.amount
            ),
        )
        .filter(
    Transaction.user_id == user_id
)
        .filter(
            Transaction.type == "debit"
        )
        .filter(
            Transaction.category != "Transfer"
        )
        .filter(
            Transaction.merchant != "Unknown"
        )
        .group_by(
            Transaction.merchant
        )
        .order_by(
            func.sum(
                Transaction.amount
            ).desc()
        )
        .limit(10)
        .all()
    )

    # ----------------------------------------
    # Recent Transactions
    # ----------------------------------------

    recent_transactions =  (
    db.query(Transaction)
    .filter(
        Transaction.category != "Transfer"
    )
    .order_by(
        Transaction.transaction_date.desc()
    )
    .limit(10)
    .all()
)

    
    # ----------------------------------------
    # Context Builder
    # ----------------------------------------

    context = f"""
FINANCIAL SNAPSHOT

Total Income: ₹{int(snapshot["income"])}

Total Expenses: ₹{int(snapshot["expenses"])}

Current Savings: ₹{int(snapshot["savings"])}

Transaction Count: {snapshot["transaction_count"]}
"""

    # ----------------------------------------
    # Top Category
    # ----------------------------------------

    if snapshot["top_category"]:

        context += f"""

TOP CATEGORY

{snapshot["top_category"][0]}
₹{int(snapshot["top_category"][1])}
"""

    # ----------------------------------------
    # Top Merchant
    # ----------------------------------------

    if snapshot["top_merchant"]:

        context += f"""

TOP MERCHANT

{snapshot["top_merchant"][0]}
₹{int(snapshot["top_merchant"][1])}
"""

    # ----------------------------------------
    # Categories
    # ----------------------------------------

    context += "\n\nCATEGORY BREAKDOWN\n"

    for category, amount in categories:

        context += (
            f"\n{category}: "
            f"₹{int(amount)}"
        )

        # ----------------------------------------
    # Top 3 Categories
    # ----------------------------------------

    context += "\n\nTOP 3 CATEGORIES\n"

    for category, amount in top_categories:

        context += (
            f"\n{category}: "
            f"₹{int(amount)}"
        )
    total_expenses = snapshot["expenses"]

    context += "\n\nCATEGORY PERCENTAGES\n"

    for category, amount in categories:
        percent = round(
        (float(amount) / total_expenses) * 100,
        1,
    )

    context += (
        f"\n{category}: "
        f"{percent}%"
    )
    # ----------------------------------------
    # Merchants
    # ----------------------------------------

    context += "\n\nTOP MERCHANTS\n"

    for merchant, amount in merchants:

        context += (
            f"\n{merchant}: "
            f"₹{int(amount)}"
        )

   # ----------------------------------------
    # Largest Transactions
    # ----------------------------------------
    largest_tx = (
    db.query(Transaction)
    .filter(
    Transaction.user_id == user_id
)
    .filter(Transaction.type == "debit")
    .filter(Transaction.category != "Transfer")
    .order_by(Transaction.amount.desc())
    .first()
)
    if largest_tx:
        context += f"""

LARGEST EXPENSE

Merchant: {largest_tx.merchant}

Category: {largest_tx.category}

Amount: ₹{int(largest_tx.amount)}
"""
    # ----------------------------------------
    # Categories
    # ----------------------------------------   
    savings_rate = 0

    if snapshot["income"] > 0:
        savings_rate = round(

        (
            snapshot["savings"]
            / snapshot["income"]
        ) * 100,

        1,
    ) 
    context += f"""

SAVINGS RATE

{savings_rate}%
"""

## SPENDING SIGNAL
    expense_count = (
    db.query(Transaction)
    .filter(
    Transaction.user_id == user_id
)
    .filter(Transaction.type == "debit")
    .filter(Transaction.category != "Transfer")
    .count()
)

    context += f"""

    EXPENSE TRANSACTION COUNT

    {expense_count}
"""
    # ----------------------------------------
    # Recent Transactions
    # ----------------------------------------

    context += "\n\nRECENT TRANSACTIONS\n"

    for tx in recent_transactions:

        context += (
            f"\n"
            f"{tx.transaction_date} | "
            f"{tx.merchant} | "
            f"{tx.category} | "
            f"₹{int(tx.amount)}"
        )

    return context

