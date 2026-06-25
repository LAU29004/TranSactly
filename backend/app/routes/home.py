from fastapi import APIRouter

from app.services.home.home_service import (
    get_home_data,
)
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1",
    tags=["Home"],
)


@router.get("/home")
@limiter.limit("30/minute")
def get_home(
    request:Request,
    start_date: str | None = None,
    end_date: str | None = None,
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):

    return get_home_data(
    user_id=current_user.id,
    start_date=start_date,
    end_date=end_date,
    page=page,
    limit=limit,
)