from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.analytics.analytics_service import (
    get_analytics,
    get_merchant_intelligence_data,
    get_ai_classification_data,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)

@limiter.limit("120/minute")
@router.get("")
def analytics(
    request:Request,
    period: str = "month",
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_analytics(
        current_user.id,
        period,
    )

@limiter.limit("120/minute")
@router.get("/merchants")
def merchant_intelligence(
    request:Request,
    period: str = "month",
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_merchant_intelligence_data(
        current_user.id,
        period,
    )

@limiter.limit("120/minute")
@router.get("/ai-classification")
def ai_classification(
    request:Request,
    period: str = "month",
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_ai_classification_data(
        current_user.id,
        period,
    )