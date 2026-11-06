from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.module_catalog.routes import router as catalog_router
from app.module_users.public import ensure_first_admin
from app.module_users.routes import router as users_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
        await ensure_first_admin(settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="MELOXO", docs_url="/api/docs", openapi_url="/api/openapi.json", lifespan=lifespan)
    register_error_handlers(app)
    app.include_router(users_router)
    app.include_router(catalog_router)

    @app.get("/api/health")
    async def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
