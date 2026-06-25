import logging
from app.services.llm.groq_embedding_service import get_groq_embedding, cosine_similarity

logger = logging.getLogger(__name__)

# --------------------------------------------------
# INTENT DICTIONARY
# --------------------------------------------------
INTENT_EXAMPLES = {
    "spending": ["where am i spending most", "show spending", "show expenses", "where is my money going", "highest expense", "top spending category", "what did i spend on"],
    "categories": ["show categories", "show spending categories", "list categories", "breakdown by category", "how are my expenses distributed"],
    "subscriptions": ["show subscriptions", "recurring payments", "monthly subscriptions", "active subscriptions", "netflix spotify renewals"],
    "income": ["show income", "salary", "earnings", "how much did i earn", "total income"],
    "savings": ["show savings", "how much have i saved", "current savings", "saving amount"],
    "anomaly": ["suspicious transaction", "fraud detection", "unusual spending", "anomaly", "abnormal transaction"],
    "merchant": ["where do i spend most", "top merchant", "highest merchant spending", "which merchant takes most money"],
}

# --------------------------------------------------
# PRECOMPUTED INTENT EMBEDDINGS (Computed once on app load via Groq API)
# --------------------------------------------------
INTENT_EMBEDDINGS = {
    intent: [get_groq_embedding(example) for example in examples]
    for intent, examples in INTENT_EXAMPLES.items()
}

# --------------------------------------------------
# DETECT INTENT ENGINE
# --------------------------------------------------
def detect_financial_intent(query: str):
    # Fetch the embedding for the user's incoming query
    query_embedding = get_groq_embedding(query)
    
    best_intent = "unknown"
    best_score = 0.0

    for intent, embeddings in INTENT_EMBEDDINGS.items():
        # Calculate the pure-python cosine similarity for each example phrase variant
        scores = [cosine_similarity(query_embedding, emb) for emb in embeddings]
        score = max(scores) if scores else 0.0

        if score > best_score:
            best_score = score
            best_intent = intent

    if best_score < 0.70:
        return "unknown"

    return best_intent