"""
Professional model for the Miamente platform.
"""

import uuid

from sqlalchemy import ARRAY, Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Professional(Base):
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
    academic_experience = Column(Text, nullable=True)  # JSON string for structured academic experience
    work_experience = Column(Text, nullable=True)  # JSON string for structured work experience
    certifications = Column(Text, nullable=True)  # JSON string for structured certifications
    languages = Column(ARRAY(String), nullable=True)
    therapy_approaches_ids = Column(ARRAY(String), nullable=True)  # List of therapeutic approach IDs
    specialty_ids = Column(ARRAY(String), nullable=True)  # New: list of specialty IDs

    # Availability settings
    timezone = Column(String(50), default="America/Bogota")
    working_hours = Column(Text, nullable=True)  # JSON string

    # Contact information
    emergency_contact = Column(String(255), nullable=True)
    emergency_phone = Column(String(20), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    professional_specialties = relationship(
        "app.models.professional_specialty.ProfessionalSpecialty",
        back_populates="professional",
    )  # Keep for backward compatibility
    professional_specialties_new = relationship(
        "app.models.professional_specialty_new.ProfessionalSpecialty",
        back_populates="professional",
    )  # New many-to-many relationship
    professional_therapeutic_approaches = relationship(
        "app.models.professional_therapeutic_approach.ProfessionalTherapeuticApproach",
        back_populates="professional",
    )
    professional_modalities = relationship(
        "app.models.professional_modality.ProfessionalModality",
        back_populates="professional",
    )
    availability = relationship("app.models.availability.Availability", back_populates="professional")

    def __repr__(self):
        return (
            f"<Professional(id={self.id}, email={self.email}, full_name={self.full_name}, specialty={self.specialty})>"
        )
