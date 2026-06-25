from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    API_VERSION: str
    MODEL_NAME: str
    GROQ_MODEL: str
    CONFIDENCE_THRESHOLD: float
    RATE_LIMIT: str
    ENVIRONMENT: str
    DATABASE_URL: str
    GROQ_API_KEY: str
    JWT_SECRET: str
    JWT_ALGORITHM: str
    GOOGLE_CLIENT_ID: str
    
    # Move this INSIDE the class
    ALLOWED_ORIGINS: list[str] = Field(
        default=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()