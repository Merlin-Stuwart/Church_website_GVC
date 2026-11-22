from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EventBase(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    category: str = "Worship"
    image_url: Optional[str] = ""
    featured: Optional[bool] = False
    registration_required: Optional[bool] = False
    extra_info: Optional[str] = ""
    extra_notices: Optional[List[str]] = []
    highlights: Optional[List[str]] = []

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None
    registration_required: Optional[bool] = None
    extra_info: Optional[str] = None
    extra_notices: Optional[List[str]] = None
    highlights: Optional[List[str]] = None

class EventResponse(EventBase):
    id: str
    created_at: Optional[datetime] = None

class EventRsvpCreate(BaseModel):
    event_id: str
    full_name: str
    email: str
    phone: str
    attendees_count: int = 1
    notes: Optional[str] = ""
