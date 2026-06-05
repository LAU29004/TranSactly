from sqlalchemy.orm import (
    Session,
)

from app.models.transaction import (
    Transaction,
)


def save_transaction(

    db: Session,

    transaction_data: dict,
):
    existing = (

    db.query(Transaction)

    .filter(
        Transaction.message
        == transaction_data["message"]
    )

    .first()
)

    if existing:
        return existing

    transaction = Transaction(

        message=
        transaction_data["message"],

        merchant=
        transaction_data["merchant"],

        intent=
        transaction_data["intent"],

        amount=
        transaction_data["amount"],

        type=
        transaction_data["type"],

        category=
        transaction_data["category"],

        confidence=
        transaction_data["confidence"],

        source=
        transaction_data["source"],

        transaction_date = transaction_data["transaction_date"]
    )

    db.add(transaction)

    db.commit()

    db.refresh(transaction)

    return transaction
