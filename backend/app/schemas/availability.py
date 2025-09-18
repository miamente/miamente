"""
Availability schemas.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.availability import SlotStatus


class AvailabilityBase(BaseModel):
    """Base availability schema."""

    professional_id: uuid.UUID
    date: datetime
    time: str  # HH:MM format
    duration: int = 60
    timezone: str = "America/Bogota"


class AvailabilityCreate(AvailabilityBase):
    """Availability creation schema."""


class AvailabilityUpdate(BaseModel):
    """Availability update schema."""

    status: Optional[SlotStatus] = None
    held_by: Optional[uuid.UUID] = None
    held_at: Optional[datetime] = None


class AvailabilityResponse(AvailabilityBase):
    """Availability response schema."""

    id: uuid.UUID
    status: SlotStatus
    held_by: Optional[uuid.UUID] = None
    held_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BulkAvailabilityCreate(BaseModel):
    """Bulk availability creation schema."""

    professional_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    time_slots: list[str]  # List of time slots in HH:MM format
    duration: int = 60
    timezone: str = "America/Bogota"
