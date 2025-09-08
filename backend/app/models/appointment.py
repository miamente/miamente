"""
Appointment model for the Miamente platform.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class AppointmentStatus(str, enum.Enum):
    """Appointment status enumeration."""
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Appointment(Base):
    """Appointment model."""
    
    __tablename__ = "appointments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    availability_id = Column(UUID(as_uuid=True), ForeignKey("availability.id"), nullable=False)
    
    # Appointment details
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING_PAYMENT)
    paid = Column(Boolean, default=False)
    
    # Time information
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Integer, default=60)  # Duration in minutes
    timezone = Column(String(50), default="America/Bogota")
    
    # Session information
    jitsi_url = Column(Text, nullable=True)
    session_notes = Column(Text, nullable=True)
    session_rating = Column(Integer, nullable=True)  # 1-5 rating
    session_feedback = Column(Text, nullable=True)
    
    # Payment information
    payment_amount_cents = Column(Integer, nullable=False)
    payment_currency = Column(String(3), default="COP")
    payment_provider = Column(String(50), default="mock")
    payment_status = Column(String(50), default="pending")
    payment_id = Column(String(255), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="appointments")
    professional = relationship("Professional", back_populates="appointments")
    availability = relationship("Availability")
    payment = relationship("Payment", back_populates="appointment", uselist=False)
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, user_id={self.user_id}, professional_id={self.professional_id}, status={self.status})>"
