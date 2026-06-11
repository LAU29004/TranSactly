from datetime import datetime
from datetime import timedelta

from jose import jwt

from app.config.settings import settings


def create_access_token(
    user_id: int,
):

    payload = {

        "sub": str(user_id),

        "exp":
        datetime.utcnow()
        + timedelta(days=30),
    }

    return jwt.encode(

        payload,

        settings.JWT_SECRET,

        algorithm=
        settings.JWT_ALGORITHM,
    )