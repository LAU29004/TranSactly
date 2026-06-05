BLOCKED_KEYWORDS = [

    "otp",

    "cashback",

    "offer",

    "reward",

    "bonus",

    "loan",
]

FAILED_KEYWORDS = [

    "failed",

    "declined",

    "unsuccessful",
]

def clean_message(
    message: str
):

    lower = message.lower()

    for keyword in BLOCKED_KEYWORDS:

        if keyword in lower:
            return None

    for keyword in FAILED_KEYWORDS :
        if keyword in lower :
            return None
    return message.strip()
