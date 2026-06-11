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
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/google",
    response_model=AuthResponse,
)
def google_login(
    payload: GoogleAuthRequest,
):

    db = SessionLocal()

    try:

        try:

            google_user = (
                verify_google_token(
                    payload.id_token
                )
            )

        except Exception:

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

        return {

            "access_token":
            access_token,

            "user_id":
            user.id,

            "name":
            user.name,

            "email":
            user.email,
        }

    finally:

        db.close()