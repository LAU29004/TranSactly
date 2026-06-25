from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.dashboard.dashboard_service import (
    get_dashboard_overview,
    get_overview_kpis,
    get_dashboard_transactions,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)

@limiter.limit("120/minute")
@router.get("")
def dashboard(
    request:Request,
    period: str = "month",
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_overview(
        current_user.id,
        period,
    )

@limiter.limit("120/minute")
@router.get("/kpi")
def overview_kpi(
    request:Request,
    period: str = "month",
    current_user: User = Depends(get_current_user),
):
    return get_overview_kpis(
        current_user.id,
        period,
    )

@limiter.limit("120/minute")
@router.get("/transactions")
def dashboard_transactions(
    request:Request,
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_transactions(
        current_user.id
    )