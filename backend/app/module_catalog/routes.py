from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, current_user
from app.core.db import get_session
from app.core.pagination import PageParams, page_body, page_params
from app.module_catalog import service

router = APIRouter(prefix="/api")


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
