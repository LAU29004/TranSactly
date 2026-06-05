from datetime import datetime

from sqlalchemy import func

from app.db.session import SessionLocal
from app.models.transaction import Transaction


def get_dashboard_insights(

    start_date: str | None = None,

    end_date: str | None = None,
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

        # -----------------------------
        # Total Income
        # -----------------------------

        income_query = (

            db.query(
                func.sum(
                    Transaction.amount
                )
            )

            .filter(
                Transaction.category
                == "Income"
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

        # -----------------------------
        # Total Expenses
        # -----------------------------

        expense_query = (

            db.query(
                func.sum(
                    Transaction.amount
                )
            )

            .filter(
                Transaction.type
                == "debit"
            )

            .filter(
                Transaction.category
                != "Transfer"
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

        # -----------------------------
        # Savings
        # -----------------------------

        total_savings = (
            total_income
            - total_expenses
        )

        savings_rate = 0

        if total_income > 0:

            savings_rate = round(

                (
                    total_savings
                    / total_income
                )
                * 100,

                1,
            )

        # -----------------------------
        # Transaction Count
        # -----------------------------

        count_query = (
            db.query(
                Transaction
            )
        )

        if start_dt:
            count_query = count_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            count_query = count_query.filter(
                Transaction.transaction_date <= end_dt
            )

        transaction_count = (
            count_query.count()
        )

        # -----------------------------
        # Category Breakdown
        # -----------------------------

        categories_query = (

            db.query(
                Transaction.category,
                func.sum(
                    Transaction.amount
                ),
            )

            .filter(
                Transaction.type
                == "debit"
            )

            .filter(
                Transaction.category
                != "Transfer"
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
            float(c[1])
            for c in categories
        )

        category_breakdown = [

            {

                "category":
                c[0],

                "amount":
                round(
                    float(c[1]),
                    2,
                ),

                "percent":
                round(
                    (
                        float(c[1])
                        / total_category_amount
                    ) * 100,
                    1,
                )
                if total_category_amount
                else 0,
            }

            for c in categories
        ]

        category_breakdown = sorted(

            category_breakdown,

            key=lambda x:
            x["amount"],

            reverse=True,
        )

        top_category = None

        if category_breakdown:

            top_category = (
                category_breakdown[0]["category"]
            )

        # -----------------------------
        # Top Merchants
        # -----------------------------

        merchants_query = (

            db.query(
                Transaction.merchant,
                func.sum(
                    Transaction.amount
                ),
            )

            .filter(
                Transaction.type
                == "debit"
            )

            .filter(
                Transaction.category
                != "Transfer"
            )

            .filter(
                Transaction.merchant
                != "Unknown"
            )
        )

        if start_dt:
            merchants_query = merchants_query.filter(
                Transaction.transaction_date >= start_dt
            )

        if end_dt:
            merchants_query = merchants_query.filter(
                Transaction.transaction_date <= end_dt
            )

        merchants = (

            merchants_query

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

        top_merchants = [

            {

                "merchant":
                merchant,

                "amount":
                round(
                    float(amount),
                    2,
                ),
            }

            for merchant, amount
            in merchants
        ]

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

            "savingsRate":
            savings_rate,

            "transactionCount":
            transaction_count,

            "topCategory":
            top_category,

            "categoryBreakdown":
            category_breakdown,

            "topMerchants":
            top_merchants,
        }

    finally:

        db.close()