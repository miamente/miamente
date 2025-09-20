"""
Professional model for the Miamente platform.
"""

import uuid

from sqlalchemy import ARRAY, Boolean, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Professional(Base, TimestampMixin):
    """Professional model."""

    __tablename__ = "professionals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    phone_country_code = Column(String(10), nullable=True)
    phone_number = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(Text, nullable=True)

    # Professional specific fields
    license_number = Column(String(100), nullable=True)
    years_experience = Column(Integer, default=0)
    rate_cents = Column(Integer, nullable=False)  # Rate in cents
    custom_rate_cents = Column(Integer, nullable=True)  # Custom rate override
    currency = Column(String(3), default="COP")
    bio = Column(Text, nullable=True)
    # JSON string for structured academic experience
    academic_experience = Column(Text, nullable=True)
    # JSON string for structured work experience
    work_experience = Column(Text, nullable=True)
    # JSON string for structured certifications
    certifications = Column(Text, nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    # List of therapeutic approach IDs
    therapy_approaches_ids = Column(ARRAY(String), nullable=True)
    # New: list of specialty IDs
    specialty_ids = Column(ARRAY(String), nullable=True)

    # Availability settings
    timezone = Column(String(50), default="America/Bogota")
    # JSON string
    working_hours = Column(Text, nullable=True)

    # Contact information
    emergency_contact = Column(String(255), nullable=True)
    emergency_phone = Column(String(20), nullable=True)

    # Relationships
    professional_specialties = relationship(
        "app.models.professional_specialty.ProfessionalSpecialty",
        back_populates="professional",
    )
    therapeutic_approaches = relationship(
        "app.models.professional_therapeutic_approach.ProfessionalTherapeuticApproach",
        back_populates="professional",
    )
    professional_modalities = relationship(
        "app.models.professional_modality.ProfessionalModality",
        back_populates="professional",
    )

    def __repr__(self):
        return (
            f"<Professional(id={self.id}, email={self.email}, "
            f"full_name={self.full_name}, specialty={self.specialty})>"
        )
