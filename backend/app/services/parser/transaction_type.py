def detect_transaction_type(
    message: str
):

    lower = message.lower()

    if (

        "credited" in lower

        or "received" in lower

    ):

        return "credit"

    return "debit"