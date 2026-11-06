"""Interfaz pública de module_playlists."""
from uuid import UUID

from sqlalchemy import func, select

from app.core.db import session_scope
from app.module_playlists.models import PlaylistSong


async def count_inclusions(song_ids: list[UUID]) -> int:
    """Cuántas playlists incluyen alguna de estas pistas. Solo un conteo, sin identidades."""
    if not song_ids:
        return 0
    query = select(func.count(func.distinct(PlaylistSong.playlist_id))).where(PlaylistSong.song_id.in_(song_ids))
    async with session_scope() as session:
        return await session.scalar(query) or 0
