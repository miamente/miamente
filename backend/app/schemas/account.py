"""
Account schemas for the Miamente platform.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class AccountBase(BaseModel):
    """Base account schema."""

    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    phone_country_code: Optional[str] = None
    phone_number: Optional[str] = None


class AccountCreate(AccountBase):
    """Account creation schema."""

    role_id: uuid.UUID
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """Ensure password has a minimum length of 8 characters."""
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return value


class AccountUpdate(BaseModel):
    """Account update schema."""

    full_name: Optional[str] = None
    phone: Optional[str] = None
    phone_country_code: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    is_verified: Optional[bool] = None


class AccountResponse(AccountBase):
    """Account response schema."""

    id: uuid.UUID
    role_id: uuid.UUID
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AccountWithRole(AccountResponse):
    """Account response with role information."""

    role_name: str

    model_config = ConfigDict(from_attributes=True)
