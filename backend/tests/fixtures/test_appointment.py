"""
Test appointment schemas.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import uuid


class TestAppointmentCreate(BaseModel):
    """Test appointment creation schema."""
    professional_id: uuid.UUID
    user_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None


class TestAppointmentUpdate(BaseModel):
    """Test appointment update schema."""
    status: Optional[str] = None
    notes: Optional[str] = None
