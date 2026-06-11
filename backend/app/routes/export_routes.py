from datetime import datetime

from fastapi import APIRouter

from app.services.export.export_service import (
    export_transactions_excel,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Export"],
)


@router.get(
    "/export-transactions"
)
def export_transactions(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):

    return export_transactions_excel(
        start_date=start_date,
        end_date=end_date,
    )