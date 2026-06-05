from sqlalchemy.orm import (
    Session,
)

from app.models.merchant_memory import (
    MerchantMemory,
)


def get_merchant_category(

    db: Session,

    merchant: str,
):

    return (

        db.query(MerchantMemory)

        .filter(
            MerchantMemory.merchant
            == merchant
        )

        .first()
    )


def save_merchant_memory(

    db: Session,

    merchant: str,

    category: str,

    confidence: float,
):

    existing = (
        get_merchant_category(
            db,
            merchant,
        )
    )

    if existing:
        return existing

    memory = MerchantMemory(

        merchant=merchant,

        category=category,

        confidence=confidence,
    )

    db.add(memory)

    db.commit()

    db.refresh(memory)

    return memory
