from fastapi import APIRouter

from app.services.home.home_service import (
    get_home_data,
)
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Home"],
)


@router.get("/home")
def get_home(
    current_user: User = Depends(
        get_current_user
    ),
):

    return get_home_data(
        current_user.id
    )