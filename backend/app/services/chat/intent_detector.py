from sentence_transformers import (
    SentenceTransformer,
    util,
)

from app.config.settings import (
    settings,
)

model = SentenceTransformer(
    settings.MODEL_NAME
)

INTENT_EXAMPLES = {

    "spending": [

        "where am i spending most",

        "show spending",

        "show expenses",

        "where is my money going",

        "highest expense",

        "top spending category",

        "what did i spend on",
    ],

    "categories": [

        "show categories",

        "show spending categories",

        "list categories",

        "breakdown by category",

        "how are my expenses distributed",
    ],

    "subscriptions": [

        "show subscriptions",

        "recurring payments",

        "monthly subscriptions",

        "active subscriptions",

        "netflix spotify renewals",
    ],

    "income": [

        "show income",

        "salary",

        "earnings",

        "how much did i earn",

        "total income",
    ],

    "savings": [

        "show savings",

        "how much have i saved",

        "current savings",

        "saving amount",
    ],

    "anomaly": [

        "suspicious transaction",

        "fraud detection",

        "unusual spending",

        "anomaly",

        "abnormal transaction",
    ],
    "merchant": [
        "where do i spend most",
        "top merchant",
        "highest merchant spending",
        "which merchant takes most money",
],

    "compare": [
        "compare this month",
        "compare spending",
        "last month vs this month",
        "month over month",
],
}

INTENT_EMBEDDINGS = {

    intent: model.encode(
        examples,
        convert_to_tensor=True,
    )

    for intent, examples
    in INTENT_EXAMPLES.items()
}


def detect_financial_intent(
    query: str,
):

    query_embedding = model.encode(
        query,
        convert_to_tensor=True,
    )

    best_intent = "unknown"

    best_score = 0

    for intent, embeddings in (
        INTENT_EMBEDDINGS.items()
    ):

        similarity = util.cos_sim(
            query_embedding,
            embeddings,
        )

        score = float(
            similarity.max()
        )

        if score > best_score:

            best_score = score

            best_intent = intent

    print(
        f"CHAT INTENT => "
        f"{best_intent} "
        f"({best_score:.3f})"
    )

    if best_score < 0.45:

        return "unknown"

    return best_intent