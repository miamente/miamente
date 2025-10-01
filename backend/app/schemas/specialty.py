"""
New Specialty schemas.
"""

import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SpecialtyBase(BaseModel):
    """Base specialty schema."""

    name: str


class SpecialtyCreate(SpecialtyBase):
    """Specialty creation schema."""


class SpecialtyUpdate(BaseModel):
    """Specialty update schema."""

    name: Optional[str] = None


class SpecialtyResponse(SpecialtyBase):
    """Specialty response schema."""

    id: uuid.UUID
    professional_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
