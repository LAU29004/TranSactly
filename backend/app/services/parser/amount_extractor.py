
import re


AMOUNT_PATTERNS = [

    r"(?:rs\.?|inr|₹)\s*(\d+(?:,\d{3})*(?:\.\d+)?)",

    r"(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:rs\.?|inr|₹)",
]


def extract_amount(
    message: str,
):

    for pattern in AMOUNT_PATTERNS:

        match = re.search(
            pattern,
            message,
            re.IGNORECASE,
        )

        if match:

            amount = (
                match.group(1)
                .replace(",", "")
            )

            return float(amount)

    return 0.0
