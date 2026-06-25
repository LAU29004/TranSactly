import logging
from groq import Groq
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Initialize Groq client (reads GROQ_API_KEY from environment)
client = Groq()

def classify_text_via_groq(text: str, contextual_options: list) -> str:
    """
    Uses Llama 3.3 to directly match text to a specific category option.
    Replaces mathematical embedding similarity checks.
    """
    try:
        options_str = ", ".join(contextual_options)
        
        prompt = (
            f"Analyze the following financial transaction detail: '{text}'.\n"
            f"Select the most appropriate category from this exact list: [{options_str}].\n"
            f"Respond with ONLY the exact category name from the list. Do not include explanation, thinking, or markdown."
        )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,  # Forces deterministic matching
            max_tokens=15
        )
        
        result = completion.choices[0].message.content.strip()
        
        # Validate that the model returned an allowed option
        for option in contextual_options:
            if result.lower() == option.lower():
                return option
                
        return "Others"
    except Exception as e:
        logger.error(f"Groq classification failure: {e}")
        return "Others"