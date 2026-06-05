from fastapi import FastAPI

from app.routes.sms import router as sms_router

from slowapi.errors import (
    RateLimitExceeded,
)

from slowapi.middleware import (
    SlowAPIMiddleware,
)

from slowapi import _rate_limit_exceeded_handler

from app.routes.insights import (
    router as insights_router,
)

from app.middleware.rate_limiter import (
    limiter,
)

from app.middleware.error_handler import (
    global_exception_handler,
)

from app.routes.health import (
    router as health_router,
)

from app.routes.chat import (
    router as chat_router,
)

from app.routes.transactions import (
    router as transactions_router,
)

app = FastAPI()

app.state.limiter = limiter

app.add_exception_handler(

    RateLimitExceeded,

    _rate_limit_exceeded_handler,
)

app.add_middleware(
    SlowAPIMiddleware
)

app.include_router(
    sms_router
)

app.include_router(
    health_router
)

app.include_router(
    chat_router
)

app.include_router(
    insights_router
)

app.include_router(
    transactions_router
)

app.add_exception_handler(

    Exception,

    global_exception_handler,
)


@app.get("/")
async def root():

    return {
        "message":
        "TranSactly AI Backend Running"
    }