from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.analytics.insights_service import (
    get_dashboard_insights,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Insights"],
)


@router.get("/insights")
def get_insights(

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