from app.db.session import SessionLocal

from app.repositories.chat_repository import (
    create_session,
    create_message,
    get_sessions,
    get_messages,
)


def create_chat_session(
    user_id,
):
    db = SessionLocal()

    try:

        session = create_session(
            db,
            user_id,
            "New Chat",
        )

        return {
            "id": session.id
        }

    finally:
        db.close()


def get_chat_sessions(
    user_id,
):
    db = SessionLocal()

    try:

        sessions = get_sessions(
            db,
            user_id,
        )

        return {
            "sessions": [
                {
                    "id": s.id,
                    "title": s.title,
                    "created_at": s.created_at,
                }
                for s in sessions
            ]
        }

    finally:
        db.close()


def get_chat_messages(
    session_id,
):
    db = SessionLocal()

    try:

        messages = get_messages(
            db,
            session_id,
        )

        return {
            "messages": [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                }
                for m in messages
            ]
        }

    finally:
        db.close()