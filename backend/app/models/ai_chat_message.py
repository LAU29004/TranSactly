from datetime import datetime , timezone

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text,
)

from sqlalchemy.orm import (
    mapped_column,
)

from app.db.base import Base


class AIChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    id = mapped_column(
        Integer,
        primary_key=True,
    )

    session_id = mapped_column(
        Integer,
        ForeignKey(
            "ai_chat_sessions.id"
        ),
        index=True,
    )

    role = mapped_column(
        String
    )

    content = mapped_column(
        Text
    )

    created_at = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
    )