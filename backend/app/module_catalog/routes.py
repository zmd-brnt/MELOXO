from uuid import UUID

from fastapi import APIRouter, Depends, Header, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, current_user, resolve_user
from app.core.db import get_session
from app.core.errors import AppError
from app.core.pagination import PageParams, page_body, page_params
from app.core.security import create_token, decode_token
from app.module_catalog import service, streaming
from app.module_users.public import get_auth_state

router = APIRouter(prefix="/api")
_bearer = HTTPBearer(auto_error=False)
TICKET_SECONDS = 3600


@router.get("/songs")
async def songs(
    q: str | None = None,
    genre: str | None = None,
    artist: str | None = None,
    tag: str | None = None,
    source: str | None = None,
    params: PageParams = Depends(page_params),
    _: CurrentUser = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    items, total = await service.search_songs(session, params, q, genre, artist, tag, source)
    return page_body(items, total, params)


@router.get("/songs/{song_id}")
async def song(song_id: UUID, _: CurrentUser = Depends(current_user), session: AsyncSession = Depends(get_session)):
    return service.to_summary(await service.get_published_song(session, song_id))


@router.get("/artists/{artist_id}")
async def artist(artist_id: UUID, _: CurrentUser = Depends(current_user), session: AsyncSession = Depends(get_session)):
    return await service.artist_page(session, artist_id)


@router.get("/genres")
async def genres(_: CurrentUser = Depends(current_user), session: AsyncSession = Depends(get_session)):
    return await service.list_genres(session)


@router.post("/songs/{song_id}/stream-ticket")
async def stream_ticket(song_id: UUID, user: CurrentUser = Depends(current_user)):
    """El elemento <audio> no puede enviar Authorization: usa un ticket corto ligado a la pista."""
    await streaming.load_target(song_id)
    ticket = create_token({"sub": str(user.id), "scope": "stream", "song_id": str(song_id)}, TICKET_SECONDS)
    return {"ticket": ticket, "expires_in": TICKET_SECONDS}


async def _authorize_stream(song_id: UUID, ticket: str | None, bearer: HTTPAuthorizationCredentials | None) -> None:
    invalid = AppError(401, "invalid_ticket", "El permiso de reproducción venció")
    if ticket is None:
        if bearer is None:
            raise AppError(401, "not_authenticated", "Inicia sesión para continuar")
        await resolve_user(bearer.credentials)
        return
    claims = decode_token(ticket)
    if claims.get("scope") != "stream" or claims.get("song_id") != str(song_id):
        raise invalid
    state = await get_auth_state(UUID(claims["sub"]))
    if state is None or state.status != "active":
        raise invalid


@router.get("/songs/{song_id}/stream")
async def stream(
    song_id: UUID,
    ticket: str | None = Query(default=None),
    range_header: str | None = Header(default=None, alias="Range"),
    bearer: HTTPAuthorizationCredentials | None = Depends(_bearer),
):
    await _authorize_stream(song_id, ticket, bearer)
    return await streaming.stream_song(song_id, range_header)
