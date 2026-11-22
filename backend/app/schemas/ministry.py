from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MinistryBase(BaseModel):
    title: str
    category: Optional[str] = "Prayer & Service"
    badge: Optional[str] = None
    tagline: Optional[str] = None
    desc: str
    meeting_time: Optional[str] = None
    leader: Optional[str] = None
    image: Optional[str] = None

class MinistryCreate(MinistryBase):
    pass

class MinistryUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    badge: Optional[str] = None
    tagline: Optional[str] = None
    desc: Optional[str] = None
    meeting_time: Optional[str] = None
    leader: Optional[str] = None
    image: Optional[str] = None

class MinistryResponse(MinistryBase):
    id: str
    created_at: Optional[datetime] = None
