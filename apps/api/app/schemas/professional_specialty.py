"""
Professional Specialty New schemas.
"""

import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfessionalSpecialtyBase(BaseModel):
    """Base professional specialty schema."""

    specialty_id: uuid.UUID
    is_active: bool = True


class ProfessionalSpecialtyCreate(ProfessionalSpecialtyBase):
    """Professional specialty creation schema."""

    professional_id: str


class ProfessionalSpecialtyUpdate(BaseModel):
    """Professional specialty update schema."""

    specialty_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class ProfessionalSpecialtyResponse(ProfessionalSpecialtyBase):
    """Professional specialty response schema."""

    id: uuid.UUID
    professional_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
