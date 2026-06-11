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

from app.routes.export_routes import (
    router as export_router,
)

from app.routes.home import router as home_router

from app.db.base import Base
from app.db.session import engine

import app.db.base_imports

from app.routes.auth import (
    router as auth_router,
)

from app.routes.user import (
    router as user_router,
)
app = FastAPI()
print(Base.metadata.tables.keys())
Base.metadata.create_all(
    bind=engine
)

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

app.include_router(
    export_router
)

app.include_router(
    home_router
)
app.include_router(
    auth_router
)
app.include_router(
    user_router
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