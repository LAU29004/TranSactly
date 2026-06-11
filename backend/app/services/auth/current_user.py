from jose import jwt
from fastapi import Header
from fastapi import HTTPException

from app.config.settings import settings


def get_current_user_id(

    authorization: str = Header(
        None
    )
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Missing token",
        )

    token = (
        authorization
        .replace(
            "Bearer ",
            "",
        )
    )

    try:

        payload = jwt.decode(

            token,

            settings.JWT_SECRET,

            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

        return int(
            payload["sub"]
        )

    except Exception:

        raise HTTPException(

            status_code=401,

            detail="Invalid token",
        )