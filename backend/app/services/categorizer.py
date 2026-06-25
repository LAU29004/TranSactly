CATEGORY_MAP = {

    # Food

    "Swiggy": "Food",
    "Zomato": "Food",
    "Wadeshwar": "Food",
    # Shopping

    "Amazon": "Shopping",
    "Flipkart": "Shopping",
    "Myntra": "Shopping",
    "Bigbasket": "Groceries",

    # Travel

    "Uber": "Travel",
    "Ola": "Travel",

    # Entertainment

    "Netflix": "Entertainment",
    "Spotify": "Entertainment",
}


KEYWORD_CATEGORIES = {

    "Food": [

        "food",
        "foods",
        "hotel",
        "restaurant",
        "cafe",
        "sweet",
        "sweets",
        "wadeshwar",
        "bakery",
        "kitchen",
        "mess",
    ],

    "Travel": [

        "petrol",
        "fuel",
        "transport",
        "bus",
        "rail",
        "uber",
        "ola",
    ],

    "Entertainment": [

        "movie",
        "cinema",
        "inox",
        "pvr",
        "enterta",
        "netflix",
        "spotify",
    ],

    "Shopping": [

        "mart",
        "store",
        "super",
        "amazon",
        "flipkart",
        "myntra",
        "mall",
    ],
}


BUSINESS_KEYWORDS = {

    "food",
    "foods",
    "hotel",
    "restaurant",
    "cafe",
    "sweet",
    "sweets",
    "bakery",
    "mart",
    "store",
    "super",
    "petrol",
    "enterprises",
    "enterprise",
    "solutions",
    "services",
    "associates",
    "industries",
    "traders",
    "agency",
    "agencies",
    "consultancy",
    "consulting",
    "technologies",
    "tech",
    "fuel",
    "transport",
    "enterta",
    "cinema",
    "movie",
    "mall",
    "kitchen",
}


def is_person_name(
    merchant: str,
):

    if merchant == "Unknown":
        return False

    merchant_lower = merchant.lower()

    for keyword in BUSINESS_KEYWORDS:

        if keyword in merchant_lower:

            return False

    words = merchant.split()

    if len(words) < 2:
        return False

    alpha_words = [

        word

        for word in words

        if word.replace(
            ".",
            ""
        ).isalpha()
    ]

    return (
        len(alpha_words)
        >= 2
    )


def classify_by_keywords(
    merchant: str,
):

    merchant_lower = merchant.lower()

    for category, keywords in (
        KEYWORD_CATEGORIES.items()
    ):

        for keyword in keywords:

            if keyword in merchant_lower:

                return category

    return None


def categorize_transaction(
    merchant: str,
):

    merchant = merchant.strip()
    merchant = merchant.rstrip( ".,:;-")

    # ---------------------------------
    # Exact merchant match
    # ---------------------------------

    if merchant in CATEGORY_MAP:

        return CATEGORY_MAP[
            merchant
        ]

    # ---------------------------------
    # Person transfer detection
    # ---------------------------------

    if is_person_name(
        merchant
    ):

        return "Transfer"

    # ---------------------------------
    # Keyword rules
    # ---------------------------------

    keyword_category = (
        classify_by_keywords(
            merchant
        )
    )

    if keyword_category:

        return keyword_category

    # ---------------------------------
    # Default
    # ---------------------------------

    return "Others"
