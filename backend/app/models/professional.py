"""
Professional model for the Miamente platform.
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Professional(Base):
    """Professional model."""
    
    __tablename__ = "professionals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(Text, nullable=True)
    
    # Professional specific fields
    specialty = Column(String(255), nullable=False)
    license_number = Column(String(100), nullable=True)
    years_experience = Column(Integer, default=0)
    rate_cents = Column(Integer, nullable=False)  # Rate in cents
    currency = Column(String(3), default="COP")
    bio = Column(Text, nullable=True)
    academic_experience = Column(Text, nullable=True)  # JSON string for structured academic experience
    work_experience = Column(Text, nullable=True)  # JSON string for structured work experience
    certifications = Column(ARRAY(String), nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    therapy_approaches = Column(ARRAY(String), nullable=True)
    
    # Availability settings
    timezone = Column(String(50), default="America/Bogota")
    working_hours = Column(Text, nullable=True)  # JSON string
    
    # Contact information
    emergency_contact = Column(String(255), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("Appointment", back_populates="professional")
    availability = relationship("Availability", back_populates="professional")
    
    def __repr__(self):
        return f"<Professional(id={self.id}, email={self.email}, full_name={self.full_name}, specialty={self.specialty})>"
