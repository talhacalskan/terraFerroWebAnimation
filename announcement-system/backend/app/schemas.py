import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


MediaType = Literal["image", "video"]


class MediaItem(BaseModel):
    url: str
    type: MediaType
    mime_type: str | None = None
    poster_url: str | None = None
    thumb_url: str | None = None
    filename: str | None = None


class AnnouncementBase(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    content: str = Field(min_length=1)
    media_data: list[MediaItem] = []
    is_active: bool = True


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementOut(AnnouncementBase):
    id: uuid.UUID
    created_at: datetime


class PresignRequest(BaseModel):
    filename: str
    content_type: str
    size: int


class MultipartInitRequest(BaseModel):
    filename: str
    content_type: str
