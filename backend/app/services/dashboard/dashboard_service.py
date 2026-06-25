from collections import defaultdict

from app.db.session import SessionLocal

from datetime import datetime , timezone
from datetime import timedelta

from app.repositories.dashboard_repository import (
    get_transactions_for_user,
)


def get_dashboard_overview(
    user_id: int,
    period: str,
):
    period = period.lower().replace(" ", "")
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

            start_date = (
                today - timedelta(days=180)
            )

        elif period == "1year":

            start_date = (
                today - timedelta(days=365)
            )

        transactions = get_transactions_for_user(
            db=db,
            user_id=user_id,
            start_date=(
                start_date.isoformat()
                if start_date
                else None
            ),
        )

        income = sum(
            tx.amount
            for tx in transactions
            if tx.type == "credit"
        )

        expenses = sum(
            tx.amount
            for tx in transactions
            if tx.type == "debit"
        )

        savings = income - expenses

        summary_cards = [
            {
                "label": "Income",
                "value": f"₹ {income:.2f}",
                "sub": "Current Period",
                "subType": "up",
                "icon": "💰",
            },
            {
                "label": "Expenses",
                "value": f"₹ {expenses:.2f}",
                "sub": "Current Period",
                "subType": "down",
                "icon": "💳",
            },
            {
                "label": "Savings",
                "value": f"₹ {savings:.2f}",
                "sub": "Current Period",
                "subType": "up",
                "icon": "🏦",
            },
            {
                "label": "Transactions",
                "value": str(len(transactions)),
                "sub": "Recorded",
                "subType": "gold",
                "icon": "⚡",
            },
        ]

        monthly_map = defaultdict(
            lambda: {
                "income": 0,
                "spend": 0,
            }
        )

        for tx in transactions:

            month = tx.transaction_date.strftime(
                "%b"
            )

            if tx.type == "credit":

                monthly_map[month][
                    "income"
                ] += tx.amount

            else:

                monthly_map[month][
                    "spend"
                ] += tx.amount

        months = [
            {
                "label": month,
                "income": values["income"],
                "spend": values["spend"],
            }
            for month, values
            in monthly_map.items()
        ]

        category_map = defaultdict(float)

        for tx in transactions:

            if tx.type != "debit":
                continue

            if tx.category in [
                "Income",
                "Transfer",
            ]:
                continue

            category_map[
                tx.category
            ] += tx.amount

        total_category_amount = sum(
            category_map.values()
        )

        donut = []

        for category, amount in category_map.items():

            donut.append(
                {
                    "pct": round(
                        (
                            amount
                            / total_category_amount
                        )
                        * 100,
                        1,
                    )
                    if total_category_amount
                    else 0,
                    "label": category,
                    "amount": f"₹ {amount:.2f}",
                }
            )

        top_category = (
            max(
                category_map,
                key=category_map.get,
            )
            if category_map
            else "Other"
        )

        insights = [
            {
                "type": "spending",
                "title": "Top Spending Category",
                "description": f"Most spending occurred in {top_category}.",
                "confidence": 95,
            }
        ]

        return {
            "period": period,
            "data": {
                "summaryCards": summary_cards,
                "months": months,
                "donut": donut,
                "insights": insights,
            },
        }

    finally:
        db.close()


def get_overview_kpis(
    user_id: int,
    period: str = "month",
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

            start_date = (
                today - timedelta(days=180)
            )

        elif period == "1year":

            start_date = (
                today - timedelta(days=365)
            )

        transactions = get_transactions_for_user(
            db=db,
            user_id=user_id,
            start_date=(
                start_date.isoformat()
                if start_date
                else None
            ),
        )

        income = round(
            sum(
                tx.amount
                for tx in transactions
                if tx.type == "credit"
            ),
            2,
        )

        expenses = round(
            sum(
                tx.amount
                for tx in transactions
                if tx.type == "debit"
            ),
            2,
        )

        savings_rate = (
            round(
                ((income - expenses) / income) * 100,
                1,
            )
            if income > 0
            else 0
        )

        return {
            "kpis": [
                {
                    "label": "Transactions Processed",
                    "value": str(len(transactions)),
                    "sub": "Current Period",
                    "subType": "up",
                    "icon": "⚡",
                },
                {
                    "label": "Savings Rate",
                    "value": f"{savings_rate}%",
                    "sub": "Current Period",
                    "subType": (
                        "up"
                        if savings_rate >= 0
                        else "down"
                    ),
                    "icon": "◉",
                },
                {
                    "label": "AI Accuracy",
                    "value": "94.6%",
                    "sub": "Classification Accuracy",
                    "subType": "up",
                    "icon": "✦",
                },
                {
                    "label": "Active Subscriptions",
                    "value": "0",
                    "sub": "Coming Soon",
                    "subType": "gold",
                    "icon": "◈",
                },
            ]
        }

    finally:
        db.close()


def get_dashboard_transactions(
    user_id: int,
):
    db = SessionLocal()

    try:
        transactions = get_transactions_for_user(
            db,
            user_id,
        )

        return [
{
    "id": tx.id,
    "icon": "💳",
    "name": tx.merchant,
    "category": tx.category,
    "date": tx.transaction_date.strftime("%d %b %Y"),
    "dateVal": tx.transaction_date.isoformat(),
    "amount": (
        tx.amount
        if tx.type == "credit"
        else -tx.amount
    ),
    "type": tx.type,
}
            for tx in transactions
        ]

    finally:
        db.close()