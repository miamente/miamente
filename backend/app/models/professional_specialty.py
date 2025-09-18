"""
Professional Specialty model for the Miamente platform.
"""

import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ProfessionalSpecialty(Base):
    """Professional Specialty model - Custom specialties for each professional."""

    __tablename__ = "professional_specialties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(
        UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False
    )
    specialty_id = Column(
        UUID(as_uuid=True), ForeignKey("specialties.id"), nullable=True
    )  # Reference to default specialty
    name = Column(String(255), nullable=False)  # Custom name or default specialty name
    description = Column(Text, nullable=False)  # Custom description
    price_cents = Column(Integer, nullable=False)  # Custom price
    currency = Column(String(3), default="COP", nullable=False)
    is_default = Column(
        Boolean, default=False, nullable=False
    )  # Boolean flag for default specialty
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(String(255), server_default=func.now())
    updated_at = Column(String(255), onupdate=func.now())

    # Relationships
    professional = relationship(
        "app.models.professional.Professional",
        back_populates="professional_specialties",
    )
    specialty = relationship(
        "app.models.specialty.Specialty", foreign_keys=[specialty_id]
    )

    def __repr__(self):
        return f"<ProfessionalSpecialty(id={self.id}, name={self.name}, price_cents={self.price_cents})>"
