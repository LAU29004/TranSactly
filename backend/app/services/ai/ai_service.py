from app.services.analytics.analytics_service import (
    get_analytics,
)

from app.services.subscriptions.subscriptions_service import (
    get_user_subscriptions,
)

from app.services.llm.groq_llm_service import (
    detect_financial_intent,
    ask_financial_advisor,
)

def ask_ai(
    user_id: int,
    message: str,
):
    question = message.lower()
    intent = detect_financial_intent(
    question
)
    analytics = get_analytics(
        user_id,
        "1year",
    )

    subscriptions = (
        get_user_subscriptions(
            user_id
        )
    )

    # Top Category

    if (
        "top category" in question
        or "spending category" in question
        or "highest spending" in question
    ):

        category = analytics[
            "kpi"
        ][
            "topCategory"
        ]

        return {
            "text":
            f"Your top spending category is {category}.",

            "insightType":
            "spending",

            "suggestions": [
                "Show top merchants",
                "Compare spending vs income",
                "How much did I save?",
            ],
        }

    # Savings

    if (
        "save" in question
        or "saving" in question
    ):

        savings_rate = analytics[
            "kpi"
        ][
            "savingsRate"
        ]

        return {
            "text":
            f"Your savings rate is {savings_rate}.",

            "insightType":
            "savings",

            "suggestions": [
                "Show spending trend",
                "Top category",
            ],
        }

    # Top Merchant

    if (
        "merchant" in question
        or "where did i spend" in question
    ):

        merchants = analytics[
            "topMerchants"
        ]

        if merchants:

            top = merchants[0]

            return {
                "text":
                f"Your highest spending merchant is {top['label']} (INR {top['value']}).",

                "insightType":
                "spending",

                "suggestions": [
                    "Show top category",
                    "Show subscriptions",
                ],
            }

    # Subscriptions

    if (
        "subscription" in question
        or "recurring" in question
    ):

        count = len(
            subscriptions[
                "subscriptions"
            ]
        )

        return {
            "text":
            f"I detected {count} recurring subscriptions.",

            "insightType":
            "subscription",

            "suggestions": [
                "Show monthly cost",
                "Show yearly cost",
            ],
        }

    # Fallback

    context = {

    "top_category":
    analytics["kpi"]["topCategory"],

    "savings_rate":
    analytics["kpi"]["savingsRate"],

    "avg_daily_spend":
    analytics["kpi"]["avgDailySpend"],

    "top_merchants":
    analytics["topMerchants"],

    "subscriptions":
    len(
        subscriptions[
            "subscriptions"
        ]
    ),
}

    groq_response = (
    ask_financial_advisor(
        question,
        context,
    )
)

    return {

    "text":
    groq_response,

    "insightType":
    "ai",

    "suggestions": [

        "Show top merchants",

        "How much did I save?",

        "What subscriptions do I have?",
    ],
}