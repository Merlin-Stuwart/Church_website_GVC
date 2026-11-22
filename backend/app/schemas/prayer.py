from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PrayerBase(BaseModel):
    name: str
    request: str
    category: str = "General"
    is_public: bool = True
    is_anonymous: bool = False

class PrayerCreate(PrayerBase):
    pass

class PrayerResponse(BaseModel):
    id: str
    name: str
    request: str
    category: str
    is_public: bool
    is_anonymous: bool
    prayer_count: int = 0
    created_at: Optional[datetime] = None
