import re

MERCHANT_PATTERNS = [

    # Most specific patterns FIRST
    r"UPI-\d+\s+([A-Za-z0-9 &._-]{3,50})",

    r"UPI\/[A-Za-z0-9]+\s+([A-Za-z0-9 &._-]{3,50})",

    r"to\s+VPA\s+([A-Za-z0-9 &._-]{3,50})",

    r"UPI.*?to\s+([A-Za-z0-9 &._-]{3,50})",
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
BANK_WORDS = {
    "HDFC",
    "ICICI",
    "SBI",
    "AXIS",
    "NEFT",
    "IMPS",
    "UPI",
    "MAHABANK",
    "HDFCBANK",
    "ICICIBANK",
    "BOB",
    "KOTAK",
    "PAYTM",
    "PHONEPE",
    "GPAY",
    "ACCOUNT",
    "BANKING",
    "BANK",
    "DEBITED",
    "CREDITED",
}
KNOWN_MERCHANTS = {

    "BATA": "BATA",

    "VI": "VI",

    "VODAFONE": "VI",

    "AIRTEL": "AIRTEL",

    "JIO": "JIO",

    "AMAZON": "AMAZON",

    "FLIPKART": "FLIPKART",

    "SWIGGY": "SWIGGY",

    "ZOMATO": "ZOMATO",

    "UBER": "UBER",

    "OLA": "OLA",

    "NETFLIX": "NETFLIX",

    "SPOTIFY": "SPOTIFY",

    "GOOGLE PAY": "Google Pay",
}
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
    merchant = merchant.rstrip( ".,:;-")

    merchant = re.sub(
        r"[^A-Za-z0-9 &._-]",
        "",
        merchant,
    )

    merchant = merchant.strip()
    merchant = merchant.rstrip( ".,:;-")

    if merchant.lower() in STOP_WORDS:
        return "Unknown"

    return merchant


def extract_merchant( message: str, ): 
    for keyword, merchant in KNOWN_MERCHANTS.items():
        if re.search(
    rf"\b{re.escape(keyword)}\b",
    message,
    re.IGNORECASE,
):
            return merchant
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
            return clean_merchant(merchant)
        
    matches = re.findall(
    r"\b[A-Z]{4,20}\b",
    message,
)

    for candidate in matches:

        if candidate not in BANK_WORDS:

            return candidate

    return "Unknown"