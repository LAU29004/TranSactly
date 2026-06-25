from app.db.session import (
    SessionLocal,
)

from app.repositories.chat_history_repository import (
    get_chat_history,
)


def get_user_chat_history(
    user_id,
):
    db = SessionLocal()

    try:

        messages = get_chat_history(
            db,
            user_id,
        )

        return {

            "messages": [

                {

                    "id":
                    m.id,

                    "role":
                    m.role,

                    "content":
                    m.content,

                    "created_at":
                    m.created_at,
                }

                for m in messages
            ]
        }

    finally:

        db.close()