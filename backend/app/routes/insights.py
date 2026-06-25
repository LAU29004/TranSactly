from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.analytics.insights_service import (
    get_dashboard_insights,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1",
    tags=["Insights"],
)


@router.get("/insights")
@limiter.limit("60/minute")
def get_insights(
    request:Request,
    current_user: User = Depends(
        get_current_user
    ),

    start_date: str | None = None,

    end_date: str | None = None,
):

    return get_dashboard_insights(

        user_id=current_user.id,

        start_date=start_date,

        end_date=end_date,
    )