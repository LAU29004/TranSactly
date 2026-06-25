from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_google_id(
    db: Session,
    google_id: str,
):

    return (
        db.query(User)
        .filter(
            User.google_id == google_id
        )
        .first()
    )

def get_user_by_email(
    db: Session,
    email: str,
):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_id(
    db: Session,
    user_id: int,
):

    return (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


def create_user(
    db: Session,
    email: str,
    name: str,
    google_id: str,
    picture: str | None,
):

    user = User(

        email=email,

        name=name,

        google_id=google_id,

        picture=picture,
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user