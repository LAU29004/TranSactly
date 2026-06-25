from collections import defaultdict

from datetime import datetime , timezone
from datetime import timedelta

from app.db.session import SessionLocal

from app.repositories.subscriptions_repository import (
    get_transactions_for_subscription_detection,
)


ICON_MAP = {
    "Netflix": ("🎬", "#E50914"),
    "Spotify": ("🎵", "#1DB954"),
    "Amazon Prime": ("📦", "#00A8E1"),
    "YouTube": ("▶️", "#FF0000"),
    "ChatGPT": ("🤖", "#10A37F"),
}


def get_user_subscriptions(
    user_id: int,
):
    db = SessionLocal()

    try:

        transactions = (
            get_transactions_for_subscription_detection(
                db,
                user_id,
            )
        )

        merchant_map = defaultdict(list)

        for tx in transactions:

            if not tx.merchant:
                continue

            merchant_map[
                tx.merchant.strip()
            ].append(tx)

        subscriptions = []

        monthly_total = 0

        for merchant, txs in merchant_map.items():

            if len(txs) < 3:
                continue

            txs = sorted(
                txs,
                key=lambda x: x.transaction_date,
            )

            amounts = [
                tx.amount
                for tx in txs
            ]

            avg_amount = (
                sum(amounts)
                / len(amounts)
            )

            intervals = []

            for i in range(
                1,
                len(txs),
            ):

                diff = (
                    txs[i].transaction_date
                    -
                    txs[i - 1].transaction_date
                ).days

                intervals.append(diff)

            if not intervals:
                continue

            avg_interval = (
                sum(intervals)
                / len(intervals)
            )

            # Monthly recurring payment
            if not (
                25 <= avg_interval <= 35
            ):
                continue

            latest_tx = txs[-1]

            next_renewal = (
                latest_tx.transaction_date
                + timedelta(days=30)
            )

            days_remaining = (
                next_renewal
                - datetime.now(timezone.utc)
            ).days

            if days_remaining < 0:

                status = "overdue"

            elif days_remaining <= 7:

                status = "due_soon"

            else:

                status = "active"

            icon, icon_bg = ICON_MAP.get(
                merchant,
                ("💳", "#F5A800"),
            )

            subscriptions.append(
                {
                    "id": latest_tx.id,
                    "name": merchant,
                    "icon": icon,
                    "iconBg": icon_bg,
                    "monthlyCost": round(
                        avg_amount,
                        2,
                    ),
                    "renewalDate": next_renewal.strftime(
                        "%d %b %Y"
                    ),
                    "status": status,
                }
            )

            monthly_total += avg_amount

        subscriptions = sorted(
            subscriptions,
            key=lambda x: x["monthlyCost"],
            reverse=True,
        )

        return {
            "subscriptions":
            subscriptions,

            "monthlyTotal":
            round(
                monthly_total,
                2,
            ),

            "yearlyTotal":
            round(
                monthly_total * 12,
                2,
            ),
        }

    finally:

        db.close()