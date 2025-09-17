"""
Appointment schemas.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.appointment import AppointmentStatus
import uuid


class AppointmentBase(BaseModel):
    """Base appointment schema."""
    professional_id: uuid.UUID
    availability_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    duration: int = 60
    timezone: str = "America/Bogota"


class AppointmentCreate(AppointmentBase):
    """Appointment creation schema."""
    pass


class AppointmentCreateDirect(BaseModel):
    """Direct appointment creation schema (without availability)."""
    professional_id: str
    start_time: str
    end_time: str
    notes: str = ""


class AppointmentUpdate(BaseModel):
    """Appointment update schema."""
    status: Optional[AppointmentStatus] = None
    session_notes: Optional[str] = None
    session_rating: Optional[int] = None
    session_feedback: Optional[str] = None
    jitsi_url: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    """Appointment response schema."""
    id: uuid.UUID
    user_id: uuid.UUID
    status: AppointmentStatus
    paid: bool
    payment_amount_cents: int
    payment_currency: str
    payment_provider: str
    payment_status: str
    jitsi_url: Optional[str] = None
    session_notes: Optional[str] = None
    session_rating: Optional[int] = None
    session_feedback: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
class BookAppointmentRequest(BaseModel):
    """Book appointment request schema."""
    professional_id: uuid.UUID
    availability_id: uuid.UUID


class BookAppointmentResponse(BaseModel):
    """Book appointment response schema."""
    appointment_id: uuid.UUID
    message: str = "Appointment booked successfully"
