from datetime import datetime

from sqlalchemy import func

from app.db.session import SessionLocal
from app.models.transaction import Transaction


def get_home_data(
    user_id: int,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int = 1,
    limit: int = 10,
):

    db = SessionLocal()

    try:

        start_dt = (
            datetime.fromisoformat(start_date)
            if start_date
            else None
        )

        end_dt = (
            datetime.fromisoformat(end_date)
            if end_date
            else None
        )

        # --------------------
        # Income
        # --------------------

        income_query = (

            db.query(
                func.sum(Transaction.amount)
            )

            .filter(
                Transaction.user_id == user_id
            )

            .filter(
                Transaction.category == "Income"
            )
        )

        if start_dt:
            income_query = income_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            income_query = income_query.filter(
                Transaction.transaction_date <= end_dt
            )

        total_income = (
            income_query.scalar()
            or 0
        )

        # --------------------
        # Expenses
        # --------------------

        expense_query = (

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
        )

        if start_dt:
            expense_query = expense_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            expense_query = expense_query.filter(
                Transaction.transaction_date <= end_dt
            )

        total_expenses = (
            expense_query.scalar()
            or 0
        )

        # --------------------
        # Savings
        # --------------------

        total_savings = (
            total_income
            - total_expenses
        )

        # --------------------
        # Categories
        # --------------------

        categories_query = (

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
        )

        if start_dt:
            categories_query = categories_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            categories_query = categories_query.filter(
                Transaction.transaction_date <= end_dt
            )

        categories = (

            categories_query

            .group_by(
                Transaction.category
            )

            .all()
        )

        total_category_amount = sum(
            float(amount)
            for _, amount in categories
        )

        category_breakdown = [

            {
                "category": category,

                "amount": round(
                    float(amount),
                    2,
                ),

                "percent": round(
                    (
                        float(amount)
                        / total_category_amount
                    ) * 100,
                    1,
                )
                if total_category_amount
                else 0,
            }

            for category, amount
            in categories
        ]

        category_breakdown.sort(

            key=lambda x:
            x["amount"],

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

        merchant_query = (

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
        )

        if start_dt:
            merchant_query = merchant_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            merchant_query = merchant_query.filter(
                Transaction.transaction_date <= end_dt
            )

        merchant = (

            merchant_query

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

                "name":
                merchant[0],

                "amount":
                round(
                    float(
                        merchant[1]
                    ),
                    2,
                ),
            }

        # --------------------
        # Monthly Trend
        # --------------------

        monthly_query = (

            db.query(

                func.date_trunc(
                    "month",
                    Transaction.transaction_date,
                ).label("month"),

                Transaction.type,

                func.sum(
                    Transaction.amount
                ),
            )

            .filter(
                Transaction.user_id == user_id
            )
        )

        if start_dt:
            monthly_query = monthly_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            monthly_query = monthly_query.filter(
                Transaction.transaction_date <= end_dt
            )

        monthly_rows = (

            monthly_query

            .group_by(
                "month",
                Transaction.type,
            )

            .order_by(
                "month"
            )

            .all()
        )

        monthly_map = {}

        for month, tx_type, amount in monthly_rows:

            month_key = month.strftime(
                "%b"
            )

            if month_key not in monthly_map:

                monthly_map[
                    month_key
                ] = {

                    "month":
                    month_key,

                    "earnings":
                    0,

                    "spending":
                    0,
                }

            if tx_type == "credit":

                monthly_map[
                    month_key
                ]["earnings"] += float(
                    amount
                )

            else:

                monthly_map[
                    month_key
                ]["spending"] += float(
                    amount
                )

        monthly_trend = list(
            monthly_map.values()
        )

        # --------------------
        # Recent Transactions
        # --------------------

        recent_query = (

            db.query(
                Transaction
            )

            .filter(
                Transaction.user_id == user_id
            )
        )

        if start_dt:
            recent_query = recent_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            recent_query = recent_query.filter(
                Transaction.transaction_date <= end_dt
            )
        offset = (page - 1) * limit
        recent_transactions = ( recent_query
        .order_by(
        Transaction.transaction_date.desc()
    )
    .offset(offset)
    .limit(limit)
    .all()
        )
        total_transactions = recent_query.count()    
        return {

    "totalIncome":
    round(float(total_income), 2),

    "totalExpenses":
    round(float(total_expenses), 2),

    "totalSavings":
    round(float(total_savings), 2),

    "topCategory":
    top_category,

    "topMerchant":
    top_merchant,

    "categoryBreakdown":
    category_breakdown,

    "monthlyTrend":
    monthly_trend,

    "recentTransactions": [
        {
            "id": tx.id,
            "merchant": tx.merchant,
            "amount": tx.amount,
            "category": tx.category,
            "type": tx.type,
            "date": tx.transaction_date,
        }
        for tx in recent_transactions
    ],

    "pagination": {

        "page": page,

        "limit": limit,

        "total": total_transactions,

        "hasMore":
        page * limit < total_transactions,
    },
}
        
    finally:

        db.close()