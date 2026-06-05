from fastapi import APIRouter

from app.services.analytics.insights_service import (
    get_dashboard_insights,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Insights"],
)


@router.get(
    "/insights"
)
def get_insights(

    start_date: str | None = None,

    end_date: str | None = None,
):

    return get_dashboard_insights(

        start_date=start_date,

        end_date=end_date,
    )