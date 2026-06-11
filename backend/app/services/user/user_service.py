from app.db.session import SessionLocal

from app.repositories.user_repository import (
    get_user_by_id,
)


def get_me(
    user_id: int,
):

    db = SessionLocal()

    try:

        user = get_user_by_id(
            db,
            user_id,
        )

        return {

            "id":
            user.id,

            "name":
            user.name,

            "email":
            user.email,

            "picture":
            user.picture,
        }

    finally:

        db.close()