from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from jose import jwt
from jose import JWTError

from app.config.settings import settings

from app.db.session import SessionLocal

from app.models.user import User


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

        user_id = int(
            payload["sub"]
        )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )

        if not user:

            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

        return user

    finally:

        db.close()