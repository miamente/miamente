"""
Professional schemas.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
import uuid


class ProfessionalBase(BaseModel):
    """Base professional schema."""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    specialty: str
    license_number: Optional[str] = None
    years_experience: int = 0
    rate_cents: int = 50000  # Default rate in cents (500 COP)
    currency: str = "COP"
    bio: Optional[str] = None
    education: Optional[str] = None
    academic_experience: Optional[List[dict]] = None  # Structured academic experience
    work_experience: Optional[List[dict]] = None  # Structured work experience
    certifications: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    therapy_approaches: Optional[List[str]] = None
    timezone: str = "America/Bogota"
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class ProfessionalCreate(ProfessionalBase):
    """Professional creation schema."""
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class ProfessionalUpdate(BaseModel):
    """Professional update schema."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    years_experience: Optional[int] = None
    rate_cents: Optional[int] = None
    currency: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    academic_experience: Optional[List[dict]] = None
    work_experience: Optional[List[dict]] = None
    certifications: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    therapy_approaches: Optional[List[str]] = None
    timezone: Optional[str] = None
    profile_picture: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    is_verified: Optional[bool] = None


class ProfessionalResponse(ProfessionalBase):
    """Professional response schema."""
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProfessionalLogin(BaseModel):
    """Professional login schema."""
    email: EmailStr
    password: str
