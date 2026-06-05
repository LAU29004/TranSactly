from sqlalchemy import (

    String,

    Integer,

    Float,
)

from sqlalchemy.orm import (

    Mapped,

    mapped_column,
)

from app.db.base import (
    Base,
)


class MerchantMemory(Base):

    __tablename__ = "merchant_memory"

    id: Mapped[int] = mapped_column(

        Integer,

        primary_key=True,

        index=True,
    )

    merchant: Mapped[str] = mapped_column(

        String,

        unique=True,
    )

    category: Mapped[str] = mapped_column(
        String
    )

    confidence: Mapped[float] = mapped_column(
        Float
    )
