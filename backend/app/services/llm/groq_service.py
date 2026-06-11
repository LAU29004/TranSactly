from groq import Groq

from app.config.settings import (
    settings,
)

client = Groq(
    api_key=settings.GROQ_API_KEY
)