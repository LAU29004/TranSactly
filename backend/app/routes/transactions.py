from fastapi import APIRouter

from app.services.analytics.transaction_history_service import (
    get_recent_transactions,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Transactions"],
)


@router.get("/transactions")
def get_transactions(

    limit: int = 20,

    start_date: str | None = None,

    end_date: str | None = None,
):

    return get_recent_transactions(

        limit=limit,

        start_date=start_date,

        end_date=end_date,
    )
def get_transactions(
    limit: int = 20,
):

    return get_recent_transactions(
        limit
    )