from sentence_transformers import (
    SentenceTransformer,
    util,
)

from sqlalchemy.orm import Session

from app.config.settings import settings

from app.repositories.merchant_repository import (
    get_merchant_category,
    save_merchant_memory,
)

from app.services.intelligence.merchant_priors import (
    MERCHANT_PRIORS,
)

from app.services.llm.gemini_service import (
    classify_merchant,
)

# --------------------------------------------------
# LOAD EMBEDDING MODEL
# --------------------------------------------------

model = SentenceTransformer(
    settings.MODEL_NAME
)

# --------------------------------------------------
# CATEGORY KNOWLEDGE
# --------------------------------------------------

CATEGORY_CONTEXTS = {

    "Food":
    "food restaurant dining cafe swiggy zomato hotel sweets bakery eating delivery",

    "Shopping":
    "shopping ecommerce amazon flipkart myntra products orders buying store supermarket",

    "Travel":
    "travel cab ride transport uber ola metro fuel petrol bus railway",

    "Entertainment":
    "movies music streaming netflix spotify subscription prime cinema pvr inox",

    "Income":
    "salary credited income payment received stipend scholarship",

    "Transfer":
    "upi transfer bank transfer sent received payment friend person",

    "Bills":
    "electricity water gas utility recharge broadband mobile internet",

    "Education":
    "college university school tuition fees exam admission course training institute",

    "Healthcare":
    "hospital clinic medical doctor pharmacy medicine healthcare diagnostic lab",

    "Utilities":
    "electricity water gas utility recharge broadband internet mobile postpaid dth",
    
    "Home Improvement":
    "sanitary hardware tiles cement steel plumbing construction electrical furniture home renovation"
}

# --------------------------------------------------
# PRECOMPUTED CATEGORY EMBEDDINGS
# --------------------------------------------------

CATEGORY_EMBEDDINGS = {

    category: model.encode(
        context,
        convert_to_tensor=True,
    )

    for category, context
    in CATEGORY_CONTEXTS.items()
}

# --------------------------------------------------
# KEYWORD RULES
# --------------------------------------------------

KEYWORD_CATEGORIES = {

    "Food": [

        "food",
        "foods",
        "hotel",
        "restaurant",
        "cafe",
        "sweet",
        "sweets",
        "bakery",
        "mess",
        "kitchen",
        "bistro",
        "diner",
        "eatery",
        "barbeque",
        "bbq",
    ],

    "Travel": [

        "petrol",
        "fuel",
        "transport",
        "metro",
        "bus",
        "rail",
        "railway",
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
        "mall",
        "amazon",
        "flipkart",
        "myntra",
    ],
    "Education": [

    "college",
    "university",
    "school",
    "tuition",
    "exam",
    "course",
    "institute",
    "academy",
],

    "Healthcare": [

    "hospital",
    "clinic",
    "medical",
    "doctor",
    "pharmacy",
    "medicine",
    "lab",
    "diagnostic",
],

    "Utilities": [

    "electricity",
    "water",
    "gas",
    "recharge",
    "broadband",
    "internet",
    "mobile",
    "postpaid",
    "dth",
    "utility",
],

"Home Improvement": [
    "sanitary",
    "hardware",
    "tiles",
    "cement",
    "steel",
    "pipes",
    "electrical",
]
}


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def classify_by_keyword(
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


BUSINESS_KEYWORDS = {

    "food",
    "sanitary",
    "ware",
    "hardware",
    "traders",
    "agency",
    "agencies",
    "enterprises",
    "enterprise",
    "services",
    "solutions",
    "industries",
    "cement",
    "steel",
    "tiles",
    "pipes",
    "stationery",
    "furniture",
    "electrical",
    "electronics",
    "mobile",
    "postpaid",
    "telecom",
    "pharma",
    "chemist",
    "medical",
    "hospital",
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
    "fuel",
    "bistro",
    "diner",
    "eatery",
    "barbeque",
    "bbq",
    "transport",
    "enterta",
    "cinema",
    "movie",
    "mall",
    "kitchen",
    "college",
    "university",
    "school",
    "institute",

    "hospital",
    "clinic",
    "medical",
    "doctor",
    "pharmacy",

    "electricity",
    "water",
    "gas",
    "broadband",
    "internet",
    "mobile",
    "utility",
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
        len(alpha_words) >= 2 and len(alpha_words) <= 4
    )


# --------------------------------------------------
# DECISION ENGINE
# --------------------------------------------------

def categorize_transaction(
    db: Session,
    user_id: int,
    message: str,
    merchant: str,
    intent: str,
    transaction_type: str,
):
    # -----------------------------------------
    # CREDIT TRANSACTION RULE
    # -----------------------------------------

    if transaction_type == "credit":

        return {

            "category": "Income",

            "confidence": 1.0,

            "source": "credit_rule",
        }

    print("\n" + "=" * 60)
    print("CATEGORIZATION START")
    print("MERCHANT :", merchant)
    print("INTENT   :", intent)
    print("MESSAGE  :", message[:150])
    print("=" * 60)
    # --------------------------------------------------
    # MERCHANT PRIORS
    # --------------------------------------------------

    if merchant in MERCHANT_PRIORS:
        print("SOURCE => MERCHANT_PRIOR |",
            merchant,
            "=>",
            MERCHANT_PRIORS[merchant],)

        return {

            "category":
            MERCHANT_PRIORS[merchant],

            "confidence":
            0.99,

            "source":
            "merchant_prior",
        }

    # --------------------------------------------------
    # KEYWORD CLASSIFICATION
    # --------------------------------------------------

    keyword_category = (
        classify_by_keyword(
            merchant
        )
    )

    if keyword_category:
        print(        "SOURCE => KEYWORD_RULE |",
        merchant,
        "=>",
        keyword_category,)

        save_merchant_memory(

    db=db,
    user_id=user_id,
    merchant=merchant,
    category=keyword_category,
    confidence=0.95,
        )

        return {

            "category":
            keyword_category,

            "confidence":
            0.95,

            "source":
            "keyword_rule",
        }

    # --------------------------------------------------
    # DATABASE MEMORY
    # --------------------------------------------------

    existing_memory = (
    get_merchant_category(
        db,
        user_id,
        merchant,
    )
    )
    if existing_memory:
        if existing_memory.category in ["Transfer" , "Others"]:
            existing_memory = None
    if existing_memory:
        print( "SOURCE => DATABASE_MEMORY |",
        merchant,
        "=>",
        existing_memory.category,)

        return {

            "category":
            existing_memory.category,

            "confidence":
            existing_memory.confidence,

            "source":
            "database_memory",
        }

    # --------------------------------------------------
    # PERSON DETECTION
    # --------------------------------------------------

    if is_person_name(
        merchant
    ):
        print(        "SOURCE => PERSON_RULE |",
        merchant,
        "=> Transfer",)

        return {

            "category":
            "Transfer",

            "confidence":
            0.99,

            "source":
            "person_rule",
        }

    # --------------------------------------------------
    # SEMANTIC AI
    # --------------------------------------------------

    scores = {}

    message_embedding = model.encode(

        message,

        convert_to_tensor=True,
    )

    merchant_embedding = None

    if merchant != "Unknown":

        merchant_embedding = model.encode(

            merchant,

            convert_to_tensor=True,
        )

    for category in CATEGORY_CONTEXTS:

        category_embedding = (
            CATEGORY_EMBEDDINGS[
                category
            ]
        )

        msg_score = util.cos_sim(

            message_embedding,

            category_embedding,
        )[0][0]

        merchant_score = 0.0

        if merchant_embedding is not None:

            merchant_score = util.cos_sim(

                merchant_embedding,

                category_embedding,
            )[0][0]

        final_score = (

            0.4 * float(msg_score)

            + 0.6 * float(
                merchant_score
            )
        )

        # Intent boosts

        if (
            intent == "salary"
            and category == "Income"
        ):
            final_score += 0.4

        if (
            intent == "subscription"
            and category == "Entertainment"
        ):
            final_score += 0.3

        if (
            intent == "shopping"
            and category == "Shopping"
        ):
            final_score += 0.3

        if (
            intent == "food"
            and category == "Food"
        ):
            final_score += 0.4

        if (
            intent == "travel"
            and category == "Travel"
        ):
            final_score += 0.3

        if (
            intent == "bill"
            and category == "Bills"
        ):
            final_score += 0.3

        if (
            intent == "transfer"
            and category == "Transfer"
        ):
            final_score += 0.1

        scores[category] = final_score

    best_category = max(
        scores,
        key=scores.get,
    )
    confidence = float(
        scores[best_category]
    )
    if confidence < 0.35:
        best_category = "Others"
    # --------------------------------------------------
    # SAVE HIGH CONFIDENCE RESULT
    # --------------------------------------------------

    if (

        merchant != "Unknown"

        and confidence >= 0.60
        and best_category not in ["Transfer" , "Others"]
        and not is_person_name(merchant)
    ):

        save_merchant_memory(

    db=db,

    user_id=user_id,

    merchant=merchant,

    category=keyword_category,

    confidence=0.95,
        )

    # --------------------------------------------------
    # GEMINI FALLBACK
    # --------------------------------------------------

    if (

        merchant != "Unknown"

        and confidence < 0.55
    ):

        try:

            gemini_result = (
                classify_merchant(
                    merchant
                )
            )

            gemini_category = (
                gemini_result.get(
                    "category",
                    best_category,
                )
            )

            gemini_confidence = float(

                gemini_result.get(
                    "confidence",
                    0.5,
                )
            )

            if (
                gemini_confidence
                >= 0.75
                and 
                gemini_category not in ["Transfer" , "Others"]
            ):

                save_merchant_memory(

    db=db,

    user_id=user_id,

    merchant=merchant,

    category=gemini_category,

    confidence=gemini_confidence
                )

                return {

                    "category":
                    gemini_category,

                    "confidence":
                    round(
                        gemini_confidence,
                        3,
                    ),

                    "source":
                    "gemini_memory",
                }

        except Exception as e:

            print(
                "GEMINI ERROR:",
                str(e),
            )

    # --------------------------------------------------
    # SEMANTIC RESULT
    # --------------------------------------------------
    print("SOURCE => SEMANTIC_AI |",
    merchant,
    "=>",
    best_category,
    "| confidence =",
    round(confidence, 3),)
    return {

        "category":
        best_category,

        "confidence":
        round(
            confidence,
            3,
        ),

        "source":
        "semantic_ai",
    }