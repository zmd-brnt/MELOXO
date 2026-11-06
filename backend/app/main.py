from fastapi import FastAPI

from app.core.errors import register_error_handlers


def create_app() -> FastAPI:
    app = FastAPI(title="MELOXO", docs_url="/api/docs", openapi_url="/api/openapi.json")
    register_error_handlers(app)

    @app.get("/api/health")
    async def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
