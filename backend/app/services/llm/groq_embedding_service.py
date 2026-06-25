import logging
import math
from groq import Groq

logger = logging.getLogger(__name__)

# Initializes the Groq client (reads GROQ_API_KEY from environment automatically)
client = Groq()

def get_groq_embedding(text: str) -> list[float]:
    """
    Fetches text embedding vectors from Groq Cloud API using nomic-embed-text-v1.5.
    """
    try:
        if not text or text.strip() == "":
            text = "unknown"

        response = client.embeddings.create(
            model="nomic-embed-text-v1.5",
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Failed to fetch Groq embedding: {e}")
        raise e

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    if not v1 or not v2:
        return 0.0
        
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    
    if not magnitude1 or not magnitude2:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)