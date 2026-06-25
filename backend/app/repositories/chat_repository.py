from app.models.ai_chat_session import (
    AIChatSession,
)

from app.models.ai_chat_message import (
    AIChatMessage,
)


def create_session(
    db,
    user_id,
    title,
):
    session = AIChatSession(
        user_id=user_id,
        title=title,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


def create_message(
    db,
    session_id,
    role,
    content,
):
    message = AIChatMessage(
        session_id=session_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()

    return message


def get_sessions(
    db,
    user_id,
):
    return (
        db.query(
            AIChatSession
        )
        .filter(
            AIChatSession.user_id
            == user_id
        )
        .order_by(
            AIChatSession.id.desc()
        )
        .all()
    )


def get_messages(
    db,
    session_id,
):
    return (
        db.query(
            AIChatMessage
        )
        .filter(
            AIChatMessage.session_id
            == session_id
        )
        .order_by(
            AIChatMessage.id.asc()
        )
        .all()
    )