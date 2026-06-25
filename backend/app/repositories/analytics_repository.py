from datetime import datetime

from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def get_transactions(
    db: Session,
    user_id: int,
    start_date: str | None = None,
):
    query = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id
        )
    )

    if start_date:

        query = query.filter(
            Transaction.transaction_date
            >= datetime.fromisoformat(
                start_date
            )
        )

    return (
        query
        .order_by(
            Transaction.transaction_date
        )
        .all()
    )


def get_merchant_intelligence(
    db: Session,
    user_id: int,
    start_date: str | None = None,
):
    query = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id
        )
    )

    if start_date:

        query = query.filter(
            Transaction.transaction_date
            >= datetime.fromisoformat(
                start_date
            )
        )

    return (
        query
        .order_by(
            Transaction.id.desc()
        )
        .all()
    )