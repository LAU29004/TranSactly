from fastapi.responses import JSONResponse


def custom_rate_limit_handler(
    request,
    exc,
):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "message":
            "Too many requests. Please try again later.",
        },
    )