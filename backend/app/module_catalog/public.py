"""Interfaz pública de module_catalog. Solo tipos simples; cada función abre su sesión."""
from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select

from app.core.db import session_scope
from app.module_catalog.import_jobs import refresh_metadata
from app.module_catalog.models import Artist, Song
from app.module_catalog.publishing import publish_due_tracks
from app.module_catalog.schemas import ArtistSummary, PublishedRelease, ReleaseCounts, SongSummary, UpcomingRelease
from app.module_catalog.service import to_artist_summary, to_summary

__all__ = [
    "ArtistSummary",
    "PublishedRelease",
    "ReleaseCounts",
    "SongSummary",
    "UpcomingRelease",
    "catalog_by_source",
    "get_artists",
    "get_songs",
    "publish_due_tracks",
    "published_since",
    "refresh_metadata",
    "release_counts",
    "song_is_playable",
    "songs_owned_by",
    "upcoming_for_artists",
]


async def get_songs(ids: list[UUID]) -> dict[UUID, SongSummary]:
    if not ids:
        return {}
    async with session_scope() as session:
        rows = (await session.execute(select(Song).where(Song.id.in_(ids)))).unique().scalars()
        return {s.id: to_summary(s) for s in rows}


async def song_is_playable(song_id: UUID) -> bool:
    async with session_scope() as session:
        status = await session.scalar(select(Song.status).where(Song.id == song_id))
    return status == "published"


async def get_artists(ids: list[UUID]) -> dict[UUID, ArtistSummary]:
    if not ids:
        return {}
    async with session_scope() as session:
        rows = (await session.execute(select(Artist).where(Artist.id.in_(ids)))).scalars()
        return {a.id: to_artist_summary(a) for a in rows}


async def upcoming_for_artists(artist_ids: list[UUID]) -> list[UpcomingRelease]:
    if not artist_ids:
        return []
    query = (
        select(Song)
        .where(Song.artist_id.in_(artist_ids), Song.status == "scheduled", Song.publish_at.is_not(None))
        .order_by(Song.publish_at)
    )
    async with session_scope() as session:
        rows = (await session.execute(query)).unique().scalars()
        return [UpcomingRelease(s.id, s.title, s.artist_id, s.artist.name, s.publish_at) for s in rows]


async def published_since(artist_ids: list[UUID], since: datetime | None) -> list[PublishedRelease]:
    """Publicaciones de Compositores. Las importaciones de Jamendo no generan avisos."""
    if not artist_ids:
        return []
    filters = [Song.artist_id.in_(artist_ids), Song.status == "published", Song.source == "local"]
    if since is not None:
        filters.append(Song.published_at > since)
    query = select(Song).where(*filters).order_by(Song.published_at.desc()).limit(50)
    async with session_scope() as session:
        rows = (await session.execute(query)).unique().scalars()
        return [PublishedRelease(to_summary(s), s.published_at) for s in rows]


async def songs_owned_by(user_id: UUID) -> list[UUID]:
    query = select(Song.id).join(Artist, Song.artist_id == Artist.id).where(Artist.owner_user_id == user_id)
    async with session_scope() as session:
        return list((await session.execute(query)).scalars())


async def catalog_by_source() -> dict[str, int]:
    query = select(Song.source, func.count()).where(Song.status == "published").group_by(Song.source)
    async with session_scope() as session:
        return dict((await session.execute(query)).all())


async def release_counts(owner_id: UUID | None = None) -> ReleaseCounts:
    query = select(Song.status, func.count()).where(Song.source == "local").group_by(Song.status)
    if owner_id is not None:
        owned = select(Artist.id).where(Artist.owner_user_id == owner_id)
        query = query.where(Song.artist_id.in_(owned))
    async with session_scope() as session:
        counts = dict((await session.execute(query)).all())
    return ReleaseCounts(scheduled=counts.get("scheduled", 0), published=counts.get("published", 0))
