from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TestimonyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    story: str = Field(..., min_length=5)
    type: str = "Miraculous Healing"
    location: Optional[str] = "Vattamalai"
    featured_home: Optional[bool] = False
    is_active: Optional[bool] = True

class TestimonyCreate(TestimonyBase):
    pass

class TestimonyResponse(BaseModel):
    id: str
    name: str
    story: str
    type: str
    date: Optional[str] = None
    location: Optional[str] = "Vattamalai"
    featured_home: Optional[bool] = False
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
