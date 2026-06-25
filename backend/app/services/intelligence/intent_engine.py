import re


INTENT_PATTERNS = {

    "salary": [

        "salary",
        "payroll",
        "salary credited",
        "monthly salary",
        "income credited",
    ],

    "subscription": [

        "subscription",
        "renewal",
        "auto debit",
        "auto-debit",
        "membership",
        "netflix",
        "spotify",
        "prime",
        "youtube premium",
    ],

    "shopping": [

        "amazon",
        "flipkart",
        "myntra",
        "order",
        "purchase",
        "shopping",
        "ecommerce",
    ],

    "travel": [

        "uber",
        "ola",
        "fuel",
        "petrol",
        "diesel",
        "travel",
        "ride",
        "cab",
        "airlines",
    ],

    "bill": [

        "electricity",
        "water bill",
        "gas bill",
        "broadband",
        "recharge",
        "utility",
        "bill payment",
    ],

    "food": [

        "restaurant",
        "hotel",
        "cafe",
        "bakery",
        "swiggy",
        "zomato",
        "dominos",
        "pizza",
        "burger",
        "food",
        "wadeshwar",
        "dining",
    ],

    "transfer": [

        "upi",
        "debited",
        "credited",
        "bank transfer",
        "imps",
        "neft",
        "rtgs",
        "sent",
        "received",
    ],
}


def detect_intent(
    message: str,
):

    text = message.lower()

    for intent, keywords in (
        INTENT_PATTERNS.items()
    ):

        for keyword in keywords:

            if keyword in text:

                return intent

    return "generic"
