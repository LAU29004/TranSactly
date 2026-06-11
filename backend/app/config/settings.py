from pydantic_settings import (
    BaseSettings,
)

from functools import lru_cache


class Settings(BaseSettings):

    APP_NAME: str

    API_VERSION: str

    MODEL_NAME: str

    CONFIDENCE_THRESHOLD: float

    RATE_LIMIT: str

    ENVIRONMENT: str

    DATABASE_URL: str

    GEMINI_API_KEY: str | None = None

    GROQ_API_KEY: str

    JWT_SECRET: str

    JWT_ALGORITHM: str

    GOOGLE_CLIENT_ID: str

    class Config:

        env_file = ".env"


@lru_cache
def get_settings():

    return Settings()


settings = get_settings()