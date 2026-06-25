from datetime import datetime , timezone
from datetime import timedelta

from jose import jwt

from app.config.settings import settings


def create_access_token(
    user_id: int,
):
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(
            timezone.utc
        ) + timedelta(
            minutes=15
        ),
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )

def create_refresh_token(
    user_id: int,
):
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(
            timezone.utc
        ) + timedelta(
            days=30
        ),
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )