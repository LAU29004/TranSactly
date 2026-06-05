from sqlalchemy import func

from app.db.session import (
    SessionLocal,
)

from app.models.transaction import (
    Transaction,
)

from app.services.chat.intent_detector import (
    detect_financial_intent,
)


def generate_chat_response(
    query: str,
):

    db = SessionLocal()

    try:

        intent = detect_financial_intent(
            query
        )

        print(
            "DETECTED INTENT:",
            intent,
        )

        # ----------------------------------------
        # SPENDING
        # ----------------------------------------

        if intent == "spending":

            categories = (

                db.query(
                    Transaction.category,
                    func.sum(
                        Transaction.amount
                    ),
                )

                .filter(
                    Transaction.type == "debit"
                )

                .filter(
                    Transaction.category != "Transfer"
                )

                .group_by(
                    Transaction.category
                )

                .all()
            )

            if not categories:

                return {
                    "text":
                    "No spending data found.",

                    "insightType":
                    "summary",
                }

            sorted_categories = sorted(
                categories,
                key=lambda x: x[1],
                reverse=True,
            )

            top = sorted_categories[0]

            total_spending = sum(
                float(c[1])
                for c in sorted_categories
            )

            bars = [

                {
                    "label":
                    c[0],

                    "amount":
                    int(c[1]),

                    "percent":
                    round(
                        (
                            float(c[1])
                            / total_spending
                        ) * 100,
                        1,
                    ),

                    "color":
                    "#D4AF37",
                }

                for c in sorted_categories
            ]

            return {

                "text":
                f"You spent most on "
                f"{top[0]} "
                f"(₹{int(top[1])}).",

                "insightType":
                "spending",

                "summary": {

                    "topCategory":
                    top[0],

                    "amount":
                    int(top[1]),
                },

                "bars":
                bars,
            }

        # ----------------------------------------
        # CATEGORIES
        # ----------------------------------------

        if intent == "categories":

            categories = (

                db.query(
                    Transaction.category,
                    func.sum(
                        Transaction.amount
                    ),
                )

                .filter(
                    Transaction.type == "debit"
                )

                .filter(
                    Transaction.category != "Transfer"
                )

                .group_by(
                    Transaction.category
                )

                .all()
            )

            if not categories:

                return {

                    "text":
                    "No category data found.",

                    "insightType":
                    "summary",
                }

            total_spending = sum(
                float(c[1])
                for c in categories
            )

            category_data = [

                {

                    "label":
                    c[0],

                    "amount":
                    int(c[1]),

                    "percent":
                    round(
                        (
                            float(c[1])
                            / total_spending
                        ) * 100,
                        1,
                    ),

                    "color":
                    "#D4AF37",
                }

                for c in categories
            ]

            return {

                "text":
                f"You have spending across "
                f"{len(category_data)} "
                f"categories.",

                "insightType":
                "spending",

                "bars":
                category_data,
            }

        # ----------------------------------------
        # SUBSCRIPTIONS
        # ----------------------------------------

        if intent == "subscriptions":

            merchants = (

                db.query(
                    Transaction.merchant,
                    func.sum(
                        Transaction.amount
                    ),
                )

                .filter(
                    Transaction.intent
                    == "subscription"
                )

                .group_by(
                    Transaction.merchant
                )

                .all()
            )

            merchant_data = [

                {

                    "name":
                    m[0],

                    "category":
                    "Subscription",

                    "amount":
                    f"₹{int(m[1])}",

                    "color":
                    "#7B72D8",
                }

                for m in merchants
            ]

            return {

                "text":
                f"I detected "
                f"{len(merchant_data)} "
                f" recurring subscriptions.",

                "insightType":
                "subscriptions",

                "merchants":
                merchant_data,
            }

        # ----------------------------------------
        # SAVINGS
        # ----------------------------------------

        if intent == "savings":

            income = (

                db.query(
                    func.sum(
                        Transaction.amount
                    )
                )

                .filter(
                    Transaction.category
                    == "Income"
                )

                .scalar()

                or 0
            )

            spending = (

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

                .scalar()

                or 0
            )

            savings = (
                income - spending
            )

            largest_category = (

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

                .group_by(
                    Transaction.category
                )

                .order_by(
                    func.sum(
                        Transaction.amount
                    ).desc()
                )

                .first()
            )

            tip = (
                "Continue saving regularly."
            )

            if largest_category:

                cat = largest_category[0]

                if cat == "Food":

                    tip = (
                        "Reducing food delivery expenses "
                        "could improve your savings."
                    )

                elif cat == "Entertainment":

                    tip = (
                        "Review subscriptions and "
                        "streaming services."
                    )

                elif cat == "Travel":

                    tip = (
                        "Transportation costs are high. "
                        "Consider optimizing travel."
                    )

                elif cat == "Shopping":

                    tip = (
                        "Shopping contributes heavily "
                        "to your spending."
                    )

            return {

                "text":
                f"Your current savings "
                f"are ₹{int(savings)}.",

                "insightType":
                "savings",

                "savings": {

                    "amount":
                    int(savings),

                    "tip":
                    tip,
                },

                "savingsTip":
                tip,
            }

        # ----------------------------------------
        # ANOMALY
        # ----------------------------------------

        if intent == "anomaly":

            debits = (

                db.query(
                    Transaction
                )

                .filter(
                    Transaction.type
                    == "debit"
                )

                .filter(
                    Transaction.category
                    != "Transfer"
                )

                .all()
            )

            if not debits:

                return {

                    "text":
                    "No spending transactions found.",

                    "insightType":
                    "summary",
                }

            avg_spend = (

                sum(
                    tx.amount
                    for tx in debits
                )

                / len(debits)
            )

            anomaly = next(

                (
                    tx

                    for tx in debits

                    if tx.amount
                    > avg_spend * 3
                ),

                None,
            )

            if anomaly:

                return {

                    "text":
                    "I detected an unusual transaction worth reviewing.",

                    "insightType":
                    "anomaly",

                    "anomaly": {

                        "merchant":
                        anomaly.merchant,

                        "description":
                        anomaly.message,

                        "amount":
                        int(
                            anomaly.amount
                        ),

                        "risk":
                        "medium",
                    },
                }

            return {

                "text":
                "No suspicious transactions detected.",

                "insightType":
                "summary",
            }

        # ----------------------------------------
        # INCOME
        # ----------------------------------------

        if intent == "income":

            income = (

                db.query(
                    func.sum(
                        Transaction.amount
                    )
                )

                .filter(
                    Transaction.category
                    == "Income"
                )

                .scalar()

                or 0
            )

            credit_count = (

                db.query(
                    Transaction
                )

                .filter(
                    Transaction.category
                    == "Income"
                )

                .count()
            )

            return {

                "text":
                f"Your total income "
                f"is ₹{int(income)}.",

                "insightType":
                "income",

                "income": {

                    "total":
                    int(income),

                    "credits":
                    credit_count,
                },
            }

        # ----------------------------------------
        # MERCHANT INSIGHT
        # ----------------------------------------

        if intent == "merchant":

            merchant_spending = (

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
                    Transaction.merchant!= "Unknown"
                )

                .group_by(
                    Transaction.merchant
                )

                .order_by(
                    func.sum(
                        Transaction.amount
                    ).desc()
                )

                .first()
            )

            if merchant_spending:

                return {

                    "text":
                    f"You spend most at "
                    f"{merchant_spending[0]}.",

                    "insightType":
                    "merchant",

                    "merchants": [

                        {

                            "name":
                            merchant_spending[0],

                            "category":
                            "Top Merchant",

                            "amount":
                            f"₹{int(merchant_spending[1])}",

                            "color":
                            "#4D9EF5",
                        }
                    ],
                }

        # ----------------------------------------
        # DEFAULT
        # ----------------------------------------

        return {

            "text":
            "I could not understand "
            "your financial query.",

            "insightType":
            "summary",
        }

    finally:

        db.close()