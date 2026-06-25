from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.user.user_service import (
    get_me,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1/user",
    tags=["User"],
)


@router.get("/me")
@limiter.limit("120/minute")
def me(
    request: Request,
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_me(
        current_user.id
    )