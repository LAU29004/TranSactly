from fastapi import APIRouter
from fastapi import HTTPException

from app.db.session import SessionLocal

from app.schemas.auth_schema import (
    GoogleAuthRequest,
    AuthResponse,
)

from app.repositories.user_repository import (
    get_user_by_google_id,
    create_user,
)

from app.services.auth.google_service import (
    verify_google_token,
)

from app.services.auth.jwt_service import (
    create_access_token,
    create_refresh_token
)

from jose import jwt
from jose import JWTError
from app.config.settings import settings
from fastapi import Request
from app.middleware.rate_limiter import limiter
from app.schemas.auth_schema import (
    GoogleAuthRequest,
    AuthResponse,
    RefreshTokenRequest,
)
import logging
logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/google",
    response_model=AuthResponse,
)
@limiter.limit("10/minute")
def google_login(
    payload: GoogleAuthRequest,
     request: Request,
):
    db = SessionLocal()
    is_new_user = False

    try:

        try:

            google_user = (
                verify_google_token(
                    payload.id_token
                )
            )

        except Exception:
            logger.exception("Google authentication failed")

            raise HTTPException(

                status_code=401,

                detail=
                "Invalid Google token",
            )

        user = (
            get_user_by_google_id(
                db,
                google_user["google_id"],
            )
        )

        if not user:
            is_new_user = True

            user = create_user(

                db=db,

                email=
                google_user["email"],

                name=
                google_user["name"],

                google_id=
                google_user["google_id"],

                picture=
                google_user["picture"],
            )

        access_token = (
            create_access_token(
                user.id
            )
        )
        refresh_token = create_refresh_token(
    user.id
)

        return {

            "access_token":
            access_token,

            "refresh_token":
            refresh_token,

            "user_id":
            user.id,

            "name":
            user.name,

            "email":
            user.email,

            "is_new_user":
            is_new_user,
        }

    finally:

        db.close()

@router.post("/refresh")
@limiter.limit("30/minute")
def refresh_token(
    payload: RefreshTokenRequest,
     request: Request,
):

    token = payload.refresh_token

    try:

        decoded = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

        if decoded.get(
            "type"
        ) != "refresh":

            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        access_token = (
            create_access_token(
                int(decoded["sub"])
            )
        )

        return {
            "access_token":
            access_token
        }

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

