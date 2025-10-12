"""
UserProfile schemas for the Miamente platform.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserProfileBase(BaseModel):
    """Base user profile schema."""

    date_of_birth: Optional[datetime] = None
    emergency_contact_name: Optional[str] = None
    emergency_phone_country_code: Optional[str] = None
    emergency_phone_number: Optional[str] = None


class UserProfileCreate(UserProfileBase):
    """User profile creation schema."""

    account_id: uuid.UUID


class UserProfileUpdate(BaseModel):
    """User profile update schema."""

    date_of_birth: Optional[datetime] = None
    emergency_contact_name: Optional[str] = None
    emergency_phone_country_code: Optional[str] = None
    emergency_phone_number: Optional[str] = None


class UserProfileResponse(UserProfileBase):
    """User profile response schema."""

    account_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

