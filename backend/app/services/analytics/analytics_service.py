from collections import defaultdict

from app.db.session import SessionLocal

from app.repositories.analytics_repository import (
    get_transactions,
    get_merchant_intelligence,
)
from datetime import datetime , timezone
from datetime import timedelta

CATEGORY_COLORS = [
    "#F5A800",
    "#FFD166",
    "#E09700",
    "#8B6CD6",
    "#2C1D55",
]


def get_analytics(
    user_id: int,
    period: str,
):
    db = SessionLocal()

    try:
        today = datetime.now(timezone.utc)

        start_date = None

        if period == "month":
            start_date = today.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

        elif period == "6months":
            start_date = (today - timedelta(days=180))

        elif period == "1year":
            start_date = (today - timedelta(days=365))

        transactions = get_transactions(
    db=db,
    user_id=user_id,
    start_date=(
        start_date.isoformat()
        if start_date
        else None
    ),
)

        credits = [
            
            tx for tx in transactions
            if tx.type == "credit"
        ]

        debits = [
            tx for tx in transactions
            if tx.type == "debit"
        ]

        total_income = sum(
            tx.amount
            for tx in credits
        )

        total_expense = sum(
            tx.amount
            for tx in debits
            if tx.category != "Transfer"
        )

        savings_rate = (
            ((total_income - total_expense) / total_income)
            * 100
            if total_income > 0
            else 0
        )

        active_days = len(
            {
                tx.transaction_date.date()
                for tx in debits
            }
        )

        avg_daily_spend = (
            total_expense / active_days
            if active_days
            else 0
        )

        # --------------------------------
        # Category Pie
        # --------------------------------

        category_map = defaultdict(float)

        for tx in debits:

            if tx.category in [
                "Income",
                "Transfer",
            ]:
                continue

            category_map[
                tx.category
            ] += tx.amount

        sorted_categories = sorted(
            category_map.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        category_pie = []

        for idx, (
            category,
            amount,
        ) in enumerate(
            sorted_categories
        ):
            category_pie.append(
                {
                    "label": category,
                    "value": round(
                        amount,
                        2,
                    ),
                    "color": CATEGORY_COLORS[
                        idx % len(
                            CATEGORY_COLORS
                        )
                    ],
                }
            )

        top_category = (
            sorted_categories[0][0]
            if sorted_categories
            else "None"
        )

        # --------------------------------
        # Monthly Trend
        # --------------------------------

        monthly_spending = defaultdict(float)

        for tx in debits:

            if tx.category == "Transfer":
                continue

            month = tx.transaction_date.strftime(
                "%b"
            )

            monthly_spending[
                month
            ] += tx.amount

        monthly_trend = [
            {
                "label": month,
                "value": round(
                    amount,
                    2,
                ),
            }
            for month, amount
            in monthly_spending.items()
        ]

        # --------------------------------
        # Income vs Expense
        # --------------------------------

        month_map = defaultdict(
            lambda: {
                "income": 0,
                "expense": 0,
            }
        )

        for tx in transactions:

            month = tx.transaction_date.strftime(
                "%b"
            )

            if tx.type == "credit":

                month_map[month][
                    "income"
                ] += tx.amount

            else:

                month_map[month][
                    "expense"
                ] += tx.amount

        income_expense = [
            {
                "label": month,
                "income": values[
                    "income"
                ],
                "expense": values[
                    "expense"
                ],
            }
            for month, values
            in month_map.items()
        ]

        # --------------------------------
        # Top Merchants
        # --------------------------------

        merchant_map = defaultdict(float)

        for tx in debits:

            if tx.merchant == "Unknown":
                continue

            merchant_map[
                tx.merchant
            ] += tx.amount

        top_merchants = sorted(
            merchant_map.items(),
            key=lambda x: x[1],
            reverse=True,
        )[:5]

        top_merchants_response = [
            {
                "label": merchant,
                "value": round(
                    amount,
                    2,
                ),
            }
            for merchant, amount
            in top_merchants
        ]

        return {

            "kpi": {

                "avgDailySpend":
                f"₹{avg_daily_spend:.2f}",

                "topCategory":
                top_category,

                "savingsRate":
                f"{savings_rate:.1f}%",
            },

            "categoryPie":
            category_pie,

            "monthlyTrend":
            monthly_trend,

            "incomeExpense":
            income_expense,

            "topMerchants":
            top_merchants_response,
        }

    finally:
        db.close()

def get_merchant_intelligence_data(
    user_id: int,
    period: str,
):
    db = SessionLocal()

    try:
        today = datetime.now(timezone.utc)
        start_date = None
        if period == "month":
            start_date = today.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
    )

        elif period == "6months":
            start_date = (today - timedelta(days=180))

        elif period == "1year":
            start_date = (today - timedelta(days=365))


        transactions = get_merchant_intelligence(
    db=db,
    user_id=user_id,
    start_date=(
        start_date.isoformat()
        if start_date
        else None
    ),
        )

        merchants = []

        for tx in transactions:

            merchants.append(
                {
                    "id": tx.id,

                    "merchant":
                    tx.merchant,

                    "category":
                    tx.category,

                    "confidence":
                    round(
                        tx.confidence * 100,
                        0,
                    ),

                    "source":
                    (
                        tx.source
                        if tx.source
                        else "semantic_ai"
                    ),
                }
            )

        return {
            "merchants":
            merchants
        }

    finally:
        db.close()

def get_ai_classification_data(
    user_id: int,
    period: str,
):
    db = SessionLocal()

    try:
        today = datetime.now(timezone.utc)
        start_date = None
        if period == "month":
            start_date = today.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
    )

        elif period == "6months":
            start_date = (today - timedelta(days=180))

        elif period == "1year":
            start_date = (today - timedelta(days=365))

        transactions = get_transactions(
    db=db,
    user_id=user_id,
    start_date=(
        start_date.isoformat()
        if start_date
        else None
    ),
)

        total_transactions = len(
            transactions
        )

        source_counts = {}

        for tx in transactions:

            source = (
                tx.source
                if tx.source
                else "semantic_ai"
            )

            source_counts[source] = (
                source_counts.get(
                    source,
                    0,
                )
                + 1
            )

        source_label_map = {

            "keyword_rule":
            "Keyword Rule",

            "merchant_prior":
            "Merchant Prior",

            "database_memory":
            "Database Memory",

            "semantic_ai":
            "Semantic AI",
        }

        sources = []

        for source, count in source_counts.items():

            pct = round(
                (
                    count
                    / total_transactions
                )
                * 100,
                1,
            ) if total_transactions else 0

            sources.append(
                {
                    "label":
                    source_label_map.get(
                        source,
                        source,
                    ),

                    "pct":
                    pct,

                    "trend": {
                        "direction":
                        "flat",

                        "value":
                        "0%",
                    },
                }
            )

        return {

            "transactionsProcessed": {

                "count":
                total_transactions,

                "trend": {

                    "direction":
                    "up",

                    "value":
                    "+0%",
                },
            },

            "sources":
            sources,
        }

    finally:
        db.close()