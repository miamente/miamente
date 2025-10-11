"""
ProfessionalProfile schemas for the Miamente platform.
"""

import json
import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, field_validator


class ProfessionalProfileBase(BaseModel):
    """Base professional profile schema."""

    license_number: Optional[str] = None
    years_experience: int = 0
    rate_cents: int
    custom_rate_cents: Optional[int] = None
    currency: str = "COP"
    short_description: Optional[str] = None
    academic_experience: Optional[List[dict]] = None
    work_experience: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    languages: Optional[List[str]] = None
    timezone: str = "America/Bogota"
    working_hours: Optional[dict] = None
    emergency_contact_name: Optional[str] = None
    emergency_phone_country_code: Optional[str] = None
    emergency_phone_number: Optional[str] = None


class ProfessionalProfileCreate(ProfessionalProfileBase):
    """Professional profile creation schema."""

    account_id: uuid.UUID


class ProfessionalProfileUpdate(BaseModel):
    """Professional profile update schema."""

    license_number: Optional[str] = None
    years_experience: Optional[int] = None
    rate_cents: Optional[int] = None
    custom_rate_cents: Optional[int] = None
    currency: Optional[str] = None
    short_description: Optional[str] = None
    academic_experience: Optional[List[dict]] = None
    work_experience: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    languages: Optional[List[str]] = None
    timezone: Optional[str] = None
    working_hours: Optional[dict] = None
    emergency_contact_name: Optional[str] = None
    emergency_phone_country_code: Optional[str] = None
    emergency_phone_number: Optional[str] = None


class ProfessionalProfileResponse(ProfessionalProfileBase):
    """Professional profile response schema."""

    account_id: uuid.UUID

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
        """Parse languages from array."""
        if isinstance(value, str):
            try:
                lang_data = json.loads(value)
                return lang_data if isinstance(lang_data, list) else []
            except json.JSONDecodeError:
                return []
        return value or []

    @field_validator("working_hours", mode="before")
    @classmethod
    def parse_working_hours(cls, value):
        """Parse working hours from JSON string to dict."""
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return {}
        return value or {}

    model_config = ConfigDict(from_attributes=True)
