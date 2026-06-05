import re

MERCHANT_PATTERNS = [

    # Most specific patterns FIRST

    r"payment to\s+(.+?)\s+on\s+\d{2}-[A-Za-z]{3}-\d{2}",

    r"to\s+(.+?)\s+on\s+\d{2}-[A-Za-z]{3}-\d{2}",

    r"at\s+(.+?)\s+on\s+\d{2}-[A-Za-z]{3}-\d{2}",

    r"from\s+(.+?)\s+on\s+\d{2}-[A-Za-z]{3}-\d{2}",

    r"for\s+(.+?)\s+subscription",

    # Generic fallbacks LAST

    r"to\s+([A-Za-z0-9 &._-]{3,50})",

    r"at\s+([A-Za-z0-9 &._-]{3,50})",

    r"towards\s+([A-Za-z0-9 &._-]{3,50})",

    r"from\s+([A-Za-z0-9 &._-]{3,50})",

    r"([A-Za-z0-9]+)\s+ride",

    r"([A-Za-z0-9]+)\s+order",
]

STOP_WORDS = {

    "transfer",
    "salary",
    "account",
    "a/c",
    "upi",
    "payment",
    "txn",
    "transaction",
    "credited",
    "debited",
}


def clean_merchant(
    merchant: str,
):

    merchant = merchant.strip()

    merchant = re.sub(
        r"[^A-Za-z0-9 &._-]",
        "",
        merchant,
    )

    merchant = merchant.strip()

    if merchant.lower() in STOP_WORDS:
        return "Unknown"

    return merchant


def extract_merchant( message: str, ): 
    for pattern in MERCHANT_PATTERNS: 
        match = re.search( pattern, message, re.IGNORECASE, ) 
        if match: 
            merchant = ( match.group(1) .strip() ) 
            merchant = re.sub(
    r"\s+on\s+\d{2}-[A-Za-z]{3}-\d{2}.*",
    "",
    merchant,
    flags=re.IGNORECASE,
)
            merchant = re.sub( r"[^A-Za-z0-9 &.-]", "", merchant, ) 
            return merchant.strip() 
        
    return "Unknown"