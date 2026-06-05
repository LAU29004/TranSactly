from fastapi import Request

from fastapi.responses import (
    JSONResponse,
)

import traceback

from app.utils.logger import (
    logger,
)

from app.schemas.base_response import (
    ErrorResponse,
)

async def global_exception_handler(

    request: Request,

    exc: Exception,
):

    # -------------------------
    # LOG FULL ERROR
    # -------------------------

    logger.error(

        f"Unhandled Error: {str(exc)}"
    )

    traceback.print_exc()

    # -------------------------
    # SAFE RESPONSE
    # -------------------------

    return JSONResponse(

        status_code=500,

        content=ErrorResponse(
            error="Internal Server Error"
        ).model_dump()
    )
