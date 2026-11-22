from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: str = "General Inquiry"
    message: str

class ContactMessageResponse(ContactMessageCreate):
    id: str
    created_at: Optional[datetime] = None

class PlanVisitCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    service_date: str
    service_time: str
    adults_count: int = 1
    kids_count: int = 0
    first_time_visit: bool = True
    special_needs_or_notes: Optional[str] = ""

class PlanVisitResponse(PlanVisitCreate):
    id: str
    status: str = "confirmed"
    created_at: Optional[datetime] = None
