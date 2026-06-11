from sqlalchemy import (

    String,

    Float,

    Integer,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import (
    Base,
)

from datetime import datetime

from sqlalchemy import DateTime

from sqlalchemy import ForeignKey

class Transaction(Base):

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(

        Integer,

        primary_key=True,

        index=True,
    )

    user_id: Mapped[int] = mapped_column(
    ForeignKey("users.id"),
    index=True,
)
    
    message: Mapped[str] = mapped_column(
        String
    )

    merchant: Mapped[str] = mapped_column(
        String
    )

    intent: Mapped[str] = mapped_column(
        String
    )

    amount: Mapped[float] = mapped_column(
        Float
    )

    type: Mapped[str] = mapped_column(
        String
    )

    category: Mapped[str] = mapped_column(
        String
    )

    confidence: Mapped[float] = mapped_column(
        Float
    )

    source: Mapped[str] = mapped_column(
        String
    )
    
    transaction_date: Mapped[datetime] = mapped_column(
    DateTime,
    default=datetime.utcnow,
)

    created_at: Mapped[datetime] = mapped_column(
    DateTime,
    default=datetime.utcnow,
)

    updated_at: Mapped[datetime] = mapped_column(
    DateTime,
    default=datetime.utcnow,
    onupdate=datetime.utcnow,
)

