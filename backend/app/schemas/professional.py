"""
Professional schemas.
"""

import json
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class ProfessionalBase(BaseModel):
    """Base professional schema."""

    email: EmailStr
    full_name: str
    phone_country_code: Optional[str] = None
    phone_number: Optional[str] = None
    # New fields for specialties, therapeutic approaches, and modalities
    specialty_ids: Optional[List[str]] = None  # New: list of specialty IDs
    modalities: Optional[List[dict]] = None  # New: list of modality objects with full details
    license_number: Optional[str] = None
    years_experience: int = 0
    rate_cents: int = 50000  # Default rate in cents (500 COP)
    currency: str = "COP"
    bio: Optional[str] = None
    academic_experience: Optional[List[dict]] = None  # Structured academic experience
    work_experience: Optional[List[dict]] = None  # Structured work experience
    certifications: Optional[List[dict]] = (
        None  # Structured certifications with name and document_url
    )
    languages: Optional[List[str]] = None
    therapy_approaches_ids: Optional[List[str]] = None  # List of therapeutic approach IDs
    timezone: str = "America/Bogota"


class ProfessionalCreate(ProfessionalBase):
    """Professional creation schema."""

    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class ProfessionalUpdate(BaseModel):
    """Professional update schema."""

    full_name: Optional[str] = None
    phone_country_code: Optional[str] = None
    phone_number: Optional[str] = None
    specialty: Optional[str] = None  # Keep for backward compatibility
    specialty_id: Optional[str] = None  # Keep for backward compatibility
    # New fields for specialties, therapeutic approaches, and modalities
    specialty_ids: Optional[List[str]] = None  # New: list of specialty IDs
    modalities: Optional[List[dict]] = None  # New: list of modality objects with full details
    license_number: Optional[str] = None
    years_experience: Optional[int] = None
    rate_cents: Optional[int] = None
    custom_rate_cents: Optional[int] = None
    currency: Optional[str] = None
    bio: Optional[str] = None
    academic_experience: Optional[List[dict]] = None
    work_experience: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    languages: Optional[List[str]] = None
    therapy_approaches: Optional[List[str]] = None  # Keep for backward compatibility
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

    @field_validator("academic_experience", mode="before")
    @classmethod
    def parse_academic_experience(cls, value):
        """Parse academic experience from JSON string to list."""
        if isinstance(value, str):
            try:
                academic_data = json.loads(value)
                return academic_data if isinstance(academic_data, list) else []
            except json.JSONDecodeError:
                return []
        return value or []

    @field_validator("work_experience", mode="before")
    @classmethod
    def parse_work_experience(cls, value):
        """Parse work experience from JSON string to list."""
        if isinstance(value, str):
            try:
                work_data = json.loads(value)
                return work_data if isinstance(work_data, list) else []
            except json.JSONDecodeError:
                return []
        return value or []

    @field_validator("certifications", mode="before")
    @classmethod
    def parse_certifications(cls, value):
        """Parse certifications from JSON string to list."""
        if isinstance(value, str):
            try:
                cert_data = json.loads(value)
                return cert_data if isinstance(cert_data, list) else []
            except json.JSONDecodeError:
                return []
        return value or []

    @field_validator("languages", mode="before")
    @classmethod
    def parse_languages(cls, value):
        """Parse languages from JSON string to list."""
        if isinstance(value, str):
            try:
                lang_data = json.loads(value)
                return lang_data if isinstance(lang_data, list) else []
            except json.JSONDecodeError:
                return []
        return value or []

    @field_validator("therapy_approaches_ids", mode="before")
    @classmethod
    def parse_therapy_approaches_ids(cls, value):
        """Parse therapy approaches IDs from JSON string to list."""
        if isinstance(value, str):
            try:
                approach_data = json.loads(value)
                return approach_data if isinstance(approach_data, list) else []
            except json.JSONDecodeError:
                return []
        return value or []

    model_config = ConfigDict(from_attributes=True)


class ProfessionalLogin(BaseModel):
    """Professional login schema."""

    email: EmailStr
    password: str
