from sqlalchemy.orm import Session

from app.models.transaction import Transaction


from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def get_transactions_for_subscription_detection(
    db: Session,
    user_id: int,
):
    """
    Returns debit transactions that may represent
    recurring subscription payments.
    """

    return (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "debit",
            Transaction.category != "Transfer",
            Transaction.category != "Income",
        )
        .order_by(
            Transaction.transaction_date.asc()
        )
        .all()
    )