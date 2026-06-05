from fastapi import APIRouter

from app.config.settings import (
    settings,
)

router = APIRouter()

@router.get(
    "/api/v1/health"
)

async def health_check():

    return {

        "status": "healthy",

        "app": settings.APP_NAME,

        "environment":
        settings.ENVIRONMENT,
    }


@router.get(
    "/api/v1/model-health"
)

async def model_health():

    return {

        "model":
        settings.MODEL_NAME,

        "status": "loaded",
    }
