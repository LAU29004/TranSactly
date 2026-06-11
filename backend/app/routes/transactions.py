from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.analytics.transaction_history_service import (
    get_recent_transactions,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Transactions"],
)


@router.get("/transactions")
def get_transactions(

    current_user: User = Depends(
        get_current_user
    ),

    limit: int = 20,

    start_date: str | None = None,

    end_date: str | None = None,
):

    return get_recent_transactions(

        user_id=current_user.id,

        limit=limit,

        start_date=start_date,

        end_date=end_date,
    )