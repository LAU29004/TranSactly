from fastapi import APIRouter
from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.schemas.ai_schema import (
    AIChatRequest,
)

from app.services.ai.ai_service import (
    ask_ai,
)
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
)

@router.post("/chat")
@limiter.limit("20/minute")
def ai_chat(
      request: Request,
    payload: AIChatRequest,
    current_user: User = Depends(
        get_current_user
    ),
):
    return ask_ai(
        current_user.id,
        payload.message,
    )