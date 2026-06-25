from functools import lru_cache
import logging
from sentence_transformers import SentenceTransformer, util
from app.config.settings import settings

logger = logging.getLogger(__name__)

# --------------------------------------------------
# LAZY LOADING HELPERS
# --------------------------------------------------

@lru_cache(maxsize=1)
def get_intent_model():
    logger.info("Initializing Intent SentenceTransformer model (Lazy Loaded)...")
    return SentenceTransformer(settings.MODEL_NAME)


@lru_cache(maxsize=1)
def get_precomputed_intent_embeddings():
    model = get_intent_model()
    logger.info("Precomputing intent dictionary arrays...")
    return {
        intent: model.encode(examples, convert_to_tensor=True)
        for intent, examples in INTENT_EXAMPLES.items()
    }


INTENT_EXAMPLES = {
    "spending": ["where am i spending most", "show spending", "show expenses", "where is my money going", "highest expense", "top spending category", "what did i spend on"],
    "categories": ["show categories", "show spending categories", "list categories", "breakdown by category", "how are my expenses distributed"],
    "subscriptions": ["show subscriptions", "recurring payments", "monthly subscriptions", "active subscriptions", "netflix spotify renewals"],
    "income": ["show income", "salary", "earnings", "how much did i earn", "total income"],
    "savings": ["show savings", "how much have i saved", "current savings", "saving amount"],
    "anomaly": ["suspicious transaction", "fraud detection", "unusual spending", "anomaly", "abnormal transaction"],
    "merchant": ["where do i spend most", "top merchant", "highest merchant spending", "which merchant takes most money"],
}

def detect_financial_intent(query: str):
    # Access the cached model and matrix computations on-demand
    model = get_intent_model()
    intent_embeddings = get_precomputed_intent_embeddings()

    query_embedding = model.encode(query, convert_to_tensor=True)
    best_intent = "unknown"
    best_score = 0

    for intent, embeddings in intent_embeddings.items():
        similarity = util.cos_sim(query_embedding, embeddings)
        score = float(similarity.max())

        if score > best_score:
            best_score = score
            best_intent = intent

    if best_score < 0.70:
        return "unknown"

    return best_intent