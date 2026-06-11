from sqlalchemy import func

from app.db.session import SessionLocal
from app.models.transaction import Transaction


def get_home_data(
    user_id: int,
):

    db = SessionLocal()

    try:

        # --------------------
        # Income
        # --------------------

        total_income = (
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

        # --------------------
        # Expenses
        # --------------------

        total_expenses = (
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

        total_savings = (
            total_income - total_expenses
        )

        # --------------------
        # Category Breakdown
        # --------------------

        categories = (
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
            .all()
        )

        category_breakdown = [
            {
                "category": category,
                "amount": round(
                    float(amount),
                    2,
                ),
            }
            for category, amount in categories
        ]

        category_breakdown.sort(
            key=lambda x: x["amount"],
            reverse=True,
        )

        top_category = (
            category_breakdown[0]["category"]
            if category_breakdown
            else None
        )

        # --------------------
        # Top Merchant
        # --------------------

        merchant = (
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

        top_merchant = None

        if merchant:

            top_merchant = {

                "name": merchant[0],

                "amount": round(
                    float(
                        merchant[1]
                    ),
                    2,
                ),
            }

        # --------------------
        # Recent Transactions
        # --------------------

        recent_transactions = (
            db.query(Transaction)
                .filter(
        Transaction.user_id == user_id
    )
            .order_by(
                Transaction.transaction_date.desc()
            )
            .limit(10)
            .all()
        )

        return {

            "totalIncome":
            round(
                total_income,
                2,
            ),

            "totalExpenses":
            round(
                total_expenses,
                2,
            ),

            "totalSavings":
            round(
                total_savings,
                2,
            ),

            "topCategory":
            top_category,

            "topMerchant":
            top_merchant,

            "categoryBreakdown":
            category_breakdown,

            "recentTransactions": [
                {
                    "id": tx.id,
                    "merchant": tx.merchant,
                    "amount": tx.amount,
                    "category": tx.category,
                    "type": tx.type,
                    "date": tx.transaction_date,
                }
                for tx
                in recent_transactions
            ],
        }

    finally:

        db.close()