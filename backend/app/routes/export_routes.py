from datetime import datetime

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.export.export_service import (
    export_transactions_excel,
)

from app.middleware.rate_limiter import (
    limiter,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Export"],
)


@router.get("/export-transactions")
@limiter.limit("10/minute")
def export_transactions(
    request: Request,
    current_user: User = Depends(
        get_current_user
    ),
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    return export_transactions_excel(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )