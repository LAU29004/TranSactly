
from app.services.cleaner.sms_cleaner import (
    clean_message,
)

from app.services.parser.amount_extractor import (
    extract_amount,
)

from app.services.parser.transaction_type import (
    detect_transaction_type,
)

from app.services.parser.merchant_extractor import (
    extract_merchant,
)

from app.services.intelligence.intent_engine import (
    detect_intent,
)

from app.services.intelligence.decision_engine import (
    categorize_transaction,
)

from app.utils.logger import (
    logger,
)

from app.db.session import (
    SessionLocal,
)

from app.repositories.transaction_repository import (
    save_transaction,
)


def process_single_transaction(
        sms_data: dict,
    user_id: int,
):
    message = sms_data.message
    sms_date = sms_data.date

    db = SessionLocal()

    try:

        # -------------------------
        # CLEANING LAYER
        # -------------------------

        cleaned = clean_message(
            message
        )

        logger.info(
            f"Processing SMS: {cleaned}"
        )

        if not cleaned:
            return None

        # -------------------------
        # PARSER LAYER
        # -------------------------

        merchant = extract_merchant(
            cleaned
        )

        logger.info(
            f"Merchant Extracted: {merchant}"
        )

        amount = extract_amount(
            cleaned
        )

        transaction_type = (
            detect_transaction_type(
                cleaned
            )
        )

        # -------------------------
        # INTENT LAYER
        # -------------------------

        intent = detect_intent(
            cleaned
        )

        logger.info(
            f"Intent Detected: {intent}"
        )

        # -------------------------
        # AI DECISION LAYER
        # -------------------------

        decision = categorize_transaction(

    db=db,

    user_id=user_id,

    message=cleaned,

    merchant=merchant,

    intent=intent,

    transaction_type=transaction_type,
        )

        logger.info(

            f"Category: "
            f"{decision['category']} | "

            f"Confidence: "
            f"{decision['confidence']}"
        )

        # -------------------------
        # FINAL STRUCTURED OBJECT
        # -------------------------

        result = {
            "user_id": user_id,

            "message": cleaned,

            "merchant": merchant,

            "intent": intent,

            "amount": amount,

            "type": transaction_type,

            "category":
            decision["category"],

            "confidence":
            decision["confidence"],

            "source":
            decision["source"],
            
            "transaction_date": sms_date,

        }

        # -------------------------
        # DATABASE PERSISTENCE
        # -------------------------

        save_transaction(

            db=db,

            transaction_data=result,
        )

        return result

    finally:

        db.close()


def process_transactions(
       messages: list[str],
    user_id: int,
):

    results = []

    for message in messages:

        parsed = (
            process_single_transaction(
                      message,
        user_id,
            )
        )

        if parsed:

            results.append(
                parsed
            )

    return results
