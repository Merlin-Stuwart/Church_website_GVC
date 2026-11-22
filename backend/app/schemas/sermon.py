from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SermonBase(BaseModel):
    title: str
    speaker: str
    date: str
    series: str
    scripture: str
    summary: str
    video_url: str
    audio_url: Optional[str] = ""
    duration: Optional[str] = "45 mins"
    category: Optional[str] = "Sunday Worship"
    language: Optional[str] = "Tamil & English"
    thumbnail: Optional[str] = ""

class SermonCreate(SermonBase):
    pass

class SermonUpdate(BaseModel):
    title: Optional[str] = None
    speaker: Optional[str] = None
    date: Optional[str] = None
    series: Optional[str] = None
    scripture: Optional[str] = None
    summary: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    duration: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    thumbnail: Optional[str] = None

class SermonResponse(SermonBase):
    id: str
    created_at: Optional[datetime] = None
