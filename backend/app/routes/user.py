from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.user.user_service import (
    get_me,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["User"],
)


@router.get("/me")
def me(

    current_user: User = Depends(
        get_current_user
    ),
):

    return get_me(
        current_user.id
    )