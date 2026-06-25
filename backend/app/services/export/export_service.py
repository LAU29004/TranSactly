from io import BytesIO
from datetime import datetime

from openpyxl import Workbook

from fastapi.responses import (
    StreamingResponse,
)

from app.db.session import (
    SessionLocal,
)

from app.models.transaction import (
    Transaction,
)


def export_transactions_excel(
    user_id: int,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    db = SessionLocal()

    try:

        query = db.query(
            Transaction
        ).filter(
            Transaction.user_id == user_id
        )

        if start_date:
            query = query.filter(
                Transaction.transaction_date >= start_date
            )

        if end_date:
            query = query.filter(
                Transaction.transaction_date <= end_date
            )

        transactions = query.order_by(
            Transaction.transaction_date.desc()
        ).all()

        wb = Workbook()

        ws = wb.active
        ws.title = "Transactions"

        ws.append([
            "Sr No",
            "Merchant",
            "Category",
            "Amount",
            "Type",
            "Date",
        ])

        for index, tx in enumerate(
            transactions,
            start=1,
        ):
            ws.append([
                index,
                tx.merchant,
                tx.category,
                tx.amount,
                tx.type,
                tx.transaction_date.strftime(
                    "%d-%b-%Y"
                ),
            ])

        output = BytesIO()

        wb.save(output)

        output.seek(0)

        return StreamingResponse(
            output,
            media_type=
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition":
                "attachment; filename=transactions.xlsx"
            },
        )

    finally:
        db.close()