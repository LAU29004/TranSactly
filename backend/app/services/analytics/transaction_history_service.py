from datetime import datetime

from app.db.session import SessionLocal
from app.models.transaction import Transaction


def get_recent_transactions(
    limit: int = 20,
    start_date: str | None = None,
    end_date: str | None = None,
):

    db = SessionLocal()

    try:

        query = db.query(
            Transaction
        )

        if start_date:

            query = query.filter(
                Transaction.transaction_date
                >= datetime.fromisoformat(
                    start_date
                )
            )

        if end_date:

            query = query.filter(
                Transaction.transaction_date
                <= datetime.fromisoformat(
                    end_date
                )
            )

        transactions = (

            query

            .order_by(
                Transaction.transaction_date.desc()
            )

            .limit(limit)

            .all()
        )

        return {

            "transactions": [

                {

                    "id":
                    tx.id,

                    "merchant":
                    tx.merchant,

                    "amount":
                    round(
                        tx.amount,
                        2,
                    ),

                    "category":
                    tx.category,

                    "type":
                    tx.type,

                    "date":
                    tx.transaction_date,
                }

                for tx in transactions
            ]
        }

    finally:

        db.close()