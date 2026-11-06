from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class SongSummary:
    id: UUID
    title: str
    artist_id: UUID
    artist: str
    album: str | None
    duration: float
    cover_url: str | None
    source: str
    license: str
    license_url: str | None
    jamendo_url: str | None
    genres: tuple[str, ...]
    status: str
    available: bool


@dataclass(frozen=True)
class ArtistSummary:
    id: UUID
    name: str
    source: str
    bio: str
    photo_url: str | None
    links: dict


@dataclass(frozen=True)
class UpcomingRelease:
    song_id: UUID
    title: str
    artist_id: UUID
    artist: str
    publish_at: datetime


@dataclass(frozen=True)
class ReleaseCounts:
    scheduled: int
    published: int
