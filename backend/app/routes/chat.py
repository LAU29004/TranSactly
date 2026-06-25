from fastapi import APIRouter, Depends, status

from app.schemas.chat_schema import (
    ChatRequest,
)

from app.services.chat.chat_engine import (
    generate_chat_response,
)

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

from app.services.chat.chat_history_service import (
    get_user_chat_history,
)

# ─── New Imports for Database Interaction ───
from sqlalchemy.orm import Session
from app.db.session import SessionLocal  # Or your app's standard get_db dependency
from app.models.ai_chat import AIChatMessage
from fastapi import Request
from app.middleware.rate_limiter import limiter

router = APIRouter(
    prefix="/api/v1",
    tags=["AI Chat"],
)

# Helper function to yield db session if not already using a dependency pattern
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat-insights")
@limiter.limit("20/minute")
def chat_insights(
    payload: ChatRequest,
     request: Request,
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


@router.get("/chat-history")
@limiter.limit("60/minute")
def chat_history(
    request:Request,
    current_user: User = Depends(
        get_current_user
    ),
):
    return get_user_chat_history(
        current_user.id
    )


@router.delete("/chat-history/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_specific_chat_message(
    request:Request,
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a single explicit chat message row validating ownership first.
    """
    try:
        msg = db.query(AIChatMessage).filter(
            AIChatMessage.id == message_id,
            AIChatMessage.user_id == current_user.id
        ).first()

        if not msg:
            return  # Message already gone or belongs to someone else

        db.delete(msg)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise e

