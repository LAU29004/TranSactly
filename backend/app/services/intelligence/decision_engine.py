from functools import lru_cache
import logging
from sentence_transformers import SentenceTransformer, util
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.repositories.merchant_repository import get_merchant_category, save_merchant_memory
from app.services.intelligence.merchant_priors import MERCHANT_PRIORS
from app.services.llm.groq_llm_service import classify_merchant
from app.services.intelligence.merchant_intelligence import MERCHANT_INTELLIGENCE

logger = logging.getLogger(__name__)

# --------------------------------------------------
# LAZY LOADING HELPERS
# --------------------------------------------------

@lru_cache(maxsize=1)
def get_embedding_model():
    """Loads the model only when explicitly called and caches it."""
    logger.info("Initializing SentenceTransformer model (Lazy Loaded)...")
    return SentenceTransformer(settings.MODEL_NAME)


@lru_cache(maxsize=1)
def get_precomputed_category_embeddings():
    """Precomputes category embeddings once, using the lazy-loaded model."""
    model = get_embedding_model()
    logger.info("Precomputing category embeddings...")
    return {
        category: model.encode(context, convert_to_tensor=True)
        for category, context in CATEGORY_CONTEXTS.items()
    }


# --------------------------------------------------
# CATEGORY KNOWLEDGE
# --------------------------------------------------
CATEGORY_CONTEXTS = {
    "Food": "food restaurant dining cafe swiggy zomato hotel sweets bakery eating delivery",
    "Shopping": "shopping ecommerce amazon flipkart myntra products orders buying store supermarket",
    "Travel": "travel cab ride transport uber ola metro fuel petrol bus railway",
    "Entertainment": "movies music streaming netflix spotify subscription prime cinema pvr inox",
    "Income": "salary credited income payment received stipend scholarship",
    "Transfer": "upi transfer bank transfer sent received payment friend person",
    "Bills": "electricity water gas utility recharge broadband mobile internet",
    "Education": "college university school tuition fees exam admission course training institute",
    "Healthcare": "hospital clinic medical doctor pharmacy medicine healthcare diagnostic lab",
    "Utilities": "electricity water gas utility recharge broadband internet mobile postpaid dth",
    "Home Improvement": "sanitary hardware tiles cement steel plumbing construction electrical furniture home renovation"
}

# --------------------------------------------------
# KEYWORD RULES
# --------------------------------------------------
KEYWORD_CATEGORIES = {
    "Food": ["food", "foods", "hotel", "restaurant", "wadeshwar", "cafe", "sweet", "sweets", "bakery", "mess", "kitchen", "bistro", "diner", "eatery", "barbeque", "bbq"],
    "Travel": ["petrol", "fuel", "metro rail", "metro ticket", "metro ride", "transport", "bus", "rail", "railway"],
    "Entertainment": ["movie", "cinema", "inox", "pvr", "enterta", "netflix", "spotify"],
    "Shopping": ["mart", "store", "super", "mall", "amazon", "flipkart", "myntra"],
    "Education": ["college", "university", "school", "tuition", "exam", "course", "institute", "academy"],
    "Healthcare": ["hospital", "clinic", "medical", "doctor", "pharmacy", "medicine", "lab", "diagnostic"],
    "Utilities": ["electricity", "water", "gas", "recharge", "broadband", "internet", "mobile", "postpaid", "dth", "utility"],
    "Home Improvement": ["sanitary", "hardware", "tiles", "cement", "steel", "pipes", "electrical", "furniture", "interior", "decor", "renovation", "wood", "plywood"]
}

def classify_by_keyword(merchant: str):
    merchant_lower = merchant.lower()
    for category, keywords in KEYWORD_CATEGORIES.items():
        for keyword in keywords:
            if keyword in merchant_lower:
                return category
    return None

BUSINESS_KEYWORDS = {
    "food", "sanitary", "ware", "hardware", "traders", "agency", "agencies", "enterprises", "enterprise", 
    "services", "solutions", "industries", "cement", "steel", "tiles", "pipes", "stationery", "furniture", 
    "electrical", "electronics", "mobile", "postpaid", "telecom", "pharma", "chemist", "medical", "hospital", 
    "foods", "hotel", "restaurant", "cafe", "sweet", "sweets", "wadeshwar", "annapurna", "mahalaxmi", 
    "sattvik", "bigtree", "bata", "bakery", "mart", "store", "super", "petrol", "fuel", "bistro", "diner", 
    "eatery", "barbeque", "bbq", "transport", "enterta", "cinema", "movie", "mall", "kitchen", "college", 
    "university", "school", "institute", "clinic", "doctor", "pharmacy", "electricity", "water", 
    "gas", "broadband", "internet", "utility", "associates", "consultancy", "consulting", "technologies", "tech"
}

def is_person_name(merchant: str):
    if merchant == "Unknown":
        return False
    merchant_lower = merchant.lower()
    for keyword in BUSINESS_KEYWORDS:
        if keyword in merchant_lower:
            return False
    words = merchant.split()
    if len(words) < 2:
        return False
    alpha_words = [word for word in words if word.replace(".", "").isalpha()]
    return len(alpha_words) >= 2 and len(alpha_words) <= 4


# --------------------------------------------------
# DECISION ENGINE
# --------------------------------------------------
def categorize_transaction(db: Session, user_id: int, message: str, merchant: str, intent: str, transaction_type: str):
    # 1. CREDIT TRANSACTION RULE
    if transaction_type == "credit":
        return {"category": "Income", "confidence": 1.0, "source": "credit_rule"}
        
    merchant_upper = merchant.upper()
    if merchant_upper in MERCHANT_INTELLIGENCE:
        return {"category": MERCHANT_INTELLIGENCE[merchant_upper], "confidence": 1.0, "source": "merchant_intelligence"}

    # 2. MERCHANT PRIORS
    if merchant in MERCHANT_PRIORS:
        return {"category": MERCHANT_PRIORS[merchant], "confidence": 0.99, "source": "merchant_prior"}

    # 3. KEYWORD CLASSIFICATION
    keyword_category = classify_by_keyword(merchant)
    if keyword_category:
        save_merchant_memory(db=db, user_id=user_id, merchant=merchant, category=keyword_category, confidence=0.95)
        return {"category": keyword_category, "confidence": 0.95, "source": "keyword_rule"}

    # 4. DATABASE MEMORY
    existing_memory = get_merchant_category(db, user_id, merchant)
    if existing_memory and existing_memory.category in ["Transfer", "Others"]:
        existing_memory = None
    if existing_memory:
        return {"category": existing_memory.category, "confidence": existing_memory.confidence, "source": "database_memory"}

    # 5. PERSON DETECTION
    if is_person_name(merchant):
        return {"category": "Transfer", "confidence": 0.99, "source": "person_rule"}

    # --------------------------------------------------
    # SEMANTIC AI (Lazy Loaded Models Used Here Only)
    # --------------------------------------------------
    model = get_embedding_model()
    category_embeddings = get_precomputed_category_embeddings()

    scores = {}
    message_embedding = model.encode(message, convert_to_tensor=True)
    merchant_embedding = model.encode(merchant, convert_to_tensor=True) if merchant != "Unknown" else None

    for category in CATEGORY_CONTEXTS:
        category_embedding = category_embeddings[category]
        msg_score = util.cos_sim(message_embedding, category_embedding)[0][0]
        merchant_score = util.cos_sim(merchant_embedding, category_embedding)[0][0] if merchant_embedding is not None else 0.0
        
        intent_bonus = 0.0
        if intent == "salary" and category == "Income": intent_bonus += 0.4
        elif intent == "subscription" and category == "Entertainment": intent_bonus += 0.3
        elif intent == "shopping" and category == "Shopping": intent_bonus += 0.3
        elif intent == "food" and category == "Food": intent_bonus += 0.4
        elif intent == "travel" and category == "Travel": intent_bonus += 0.3
        elif intent == "bill" and category == "Bills": intent_bonus += 0.3
        elif intent == "transfer" and category == "Transfer": intent_bonus += 0.1

        scores[category] = (0.25 * float(msg_score)) + (0.55 * float(merchant_score)) + (0.20 * intent_bonus)

    best_category = max(scores, key=scores.get)
    confidence = float(scores[best_category])
    if confidence < 0.35:
        best_category = "Others"

    # 6. SAVE HIGH CONFIDENCE RESULT
    if merchant != "Unknown" and confidence >= 0.60 and best_category not in ["Transfer", "Others"] and not is_person_name(merchant):
        save_merchant_memory(db=db, user_id=user_id, merchant=merchant, category=best_category, confidence=confidence)

    # 7. GEMINI FALLBACK
    if merchant != "Unknown" and confidence < 0.55:
        try:
            gemini_result = classify_merchant(merchant)
            gemini_category = gemini_result.get("category", best_category)
            gemini_confidence = float(gemini_result.get("confidence", 0.5))

            if gemini_confidence >= 0.75 and gemini_category not in ["Transfer", "Others"]:
                save_merchant_memory(db=db, user_id=user_id, merchant=merchant, category=gemini_category, confidence=gemini_confidence)
                return {"category": gemini_category, "confidence": round(gemini_confidence, 3), "source": "gemini_memory"}
        except Exception:
            logger.exception("Transaction failed")

    return {"category": best_category, "confidence": round(confidence, 3), "source": "semantic_ai"}