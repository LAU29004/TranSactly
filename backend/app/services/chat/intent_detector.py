import logging
from groq import Groq

logger = logging.getLogger(__name__)

# Initialize the Groq client
client = Groq()

INTENT_GUIDE = """
- spending: User wants to know where they spend money, total expenses, or highest costs.
- categories: User is asking for lists, breakdowns, or distributions of expenses by category.
- subscriptions: User wants to see recurring payments, streaming services, or bills.
- income: User asks about salary, earnings, deposits, or paychecks.
- savings: User asks how much they saved or current savings balances.
- anomaly: User is looking for fraud, suspicious charges, or unusual spending spikes.
- merchant: User wants to pinpoint which specific store/vendor takes most of their cash.
"""

def detect_financial_intent(query: str) -> str:
    """
    Detects financial queries intent natively using Llama 3.3.
    """
    try:
        prompt = (
            f"Analyze this user message: '{query}'\n"
            f"Based on these rules:\n{INTENT_GUIDE}\n"
            f"Classify it into exactly one of these intents: [spending, categories, subscriptions, income, savings, anomaly, merchant].\n"
            f"If it fits nothing clearly, reply with 'unknown'.\n"
            f"Reply with ONLY the raw intent keyword. Do not include markdown, formatting, or thinking process."
        )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=10
        )
        
        detected = completion.choices[0].message.content.strip().lower()
        valid_intents = ["spending", "categories", "subscriptions", "income", "savings", "anomaly", "merchant"]
        
        return detected if detected in valid_intents else "unknown"
    except Exception as e:
        logger.error(f"Intent parsing failure via Groq Llama: {e}")
        return "unknown"