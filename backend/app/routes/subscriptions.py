from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.subscriptions.subscriptions_service import (
    get_user_subscriptions,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1/subscriptions",
    tags=["Subscriptions"],
)


@router.get("")
@limiter.limit("120/minute")
def subscriptions(
    request:Request,
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_user_subscriptions(
        current_user.id
    )