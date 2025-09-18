"""
Availability model for the Miamente platform.
"""

import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SlotStatus(str, enum.Enum):
    """Slot status enumeration."""

    FREE = "free"
    HELD = "held"
    BOOKED = "booked"
    CANCELLED = "cancelled"


class Availability(Base):
    """Availability model for professional time slots."""

    __tablename__ = "availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(
        UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False
    )

    # Time information
    date = Column(DateTime(timezone=True), nullable=False)
    time = Column(String(10), nullable=False)  # HH:MM format
    duration = Column(Integer, default=60)  # Duration in minutes
    timezone = Column(String(50), default="America/Bogota")

    # Slot management
    status = Column(Enum(SlotStatus), default=SlotStatus.FREE)
    held_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    held_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    professional = relationship("Professional", back_populates="availability")
    user = relationship("User", back_populates="held_slots")

    def __repr__(self):
        return f"<Availability(id={self.id}, professional_id={self.professional_id}, date={self.date}, status={self.status})>"
