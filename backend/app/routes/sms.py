from fastapi import APIRouter

from fastapi import Request

from app.schemas.sms_schema import (
    SMSRequest,
)

from app.services.pipeline.transaction_pipeline import (
    process_transactions,
)

from app.middleware.rate_limiter import (
    limiter,
)

from app.schemas.base_response import (
    SuccessResponse,
)

from fastapi import Depends

from app.models.user import User

from app.services.auth.dependencies import (
    get_current_user,
)

router = APIRouter()

@router.post(
    "/api/v1/analyze-sms"
)

@limiter.limit("10/minute")
async def analyze_sms(

    request: Request,

    data: SMSRequest,

    current_user: User = Depends(
        get_current_user
    ),

):

    unique_messages = []
    seen = set()
    for sms in data.messages:
        if sms.message in seen :
            continue
        seen.add(sms.message)
        unique_messages.append(sms)
    results = process_transactions(
    unique_messages,
    current_user.id,
    )

    return SuccessResponse(

    message=
    "Transactions analyzed successfully",

    data=results,
)

