from sqlalchemy.orm import (
    Session,
)

from app.models.merchant_memory import (
    MerchantMemory,
)


def get_merchant_category(
    db: Session,
    user_id: int,
    merchant: str,
):

    return (

        db.query(MerchantMemory)
        .filter(
            MerchantMemory.user_id
            == user_id
        )

        .filter(
            MerchantMemory.merchant
            == merchant
        )

        .first()
    )


def save_merchant_memory(

    db: Session,

    user_id: int,

    merchant: str,

    category: str,

    confidence: float,
):

    existing = (
        get_merchant_category(
        db,
        user_id,
        merchant,
        )
    )

    if existing:
        if confidence > existing.confidence:
            existing.category = category
            existing.confidence = confidence
            db.commit()
            db.refresh(existing)
        return existing

    memory = MerchantMemory(

    user_id=user_id,

    merchant=merchant,

    category=category,

    confidence=confidence,
    )

    db.add(memory)

    db.commit()

    db.refresh(memory)

    return memory
