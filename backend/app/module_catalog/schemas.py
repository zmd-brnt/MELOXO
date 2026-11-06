from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


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


class ImportIn(BaseModel):
    genres: list[str] = Field(default_factory=list, max_length=30)
    limit_per_genre: int = Field(default=200, ge=1, le=5000)
    order: str = "popularity_total"


class ImportJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    params: dict
    offset: int
    imported: int
    error: str | None
    created_at: datetime
    finished_at: datetime | None
