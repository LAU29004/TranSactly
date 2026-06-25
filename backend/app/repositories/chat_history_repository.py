from app.models.ai_chat import (
    AIChatMessage,
)


def create_chat_message(
    db,
    user_id,
    role,
    content,
):
    message = AIChatMessage(
        user_id=user_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()

    return message


def get_chat_history(
    db,
    user_id,
):
    return (
        db.query(
            AIChatMessage
        )
        .filter(
            AIChatMessage.user_id
            == user_id
        )
        .order_by(
            AIChatMessage.id.asc()
        )
        .all()
    )