from sqlalchemy import String
from sqlalchemy import Integer

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from app.db.base import Base


class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String,
    )

    google_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
    )

    picture: Mapped[str] = mapped_column(
        String,
        nullable=True,
    )