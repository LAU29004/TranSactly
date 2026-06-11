
from fastapi import APIRouter

from app.schemas.chat_schema import (
    ChatRequest,
)

from app.services.chat.chat_engine import (
    generate_chat_response,
)
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)
router = APIRouter(
    prefix="/api/v1",
    tags=["AI Chat"],
)


@router.post("/chat-insights")
def chat_insights(
    payload: ChatRequest,
    current_user: User = Depends(
        get_current_user
    ),
):

    response = (
    generate_chat_response(
        payload.query,
        current_user.id,
    )
    )

    return response
