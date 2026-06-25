from datetime import datetime , timezone

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    DateTime,
)

from sqlalchemy.orm import (
    mapped_column,
)

from app.db.base import Base


class AIChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    id = mapped_column(
        Integer,
        primary_key=True,
    )

    user_id = mapped_column(
        Integer,
        ForeignKey("users.id"),
        index=True,
    )

    title = mapped_column(
        String,
        default="New Chat",
    )

    created_at = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
    )