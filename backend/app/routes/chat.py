
from fastapi import APIRouter

from app.schemas.chat_schema import (
    ChatRequest,
)

from app.services.chat.chat_engine import (
    generate_chat_response,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["AI Chat"],
)


@router.post(
    "/chat-insights"
)
def chat_insights(
    payload: ChatRequest,
):

    response = (
        generate_chat_response(
            payload.query
        )
    )

    return response
