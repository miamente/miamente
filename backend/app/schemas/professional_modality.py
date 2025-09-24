"""
Professional Modality schemas.
"""

import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfessionalModalityBase(BaseModel):
    """Base professional modality schema."""

    modality_id: Optional[uuid.UUID] = None
    modality_name: str
    description: str
    virtual_price: int
    presencial_price: int
    offers_presencial: bool = False
    is_default: bool = False
    is_active: bool = True


class ProfessionalModalityCreate(ProfessionalModalityBase):
    """Professional modality creation schema."""

    professional_id: str


class ProfessionalModalityUpdate(BaseModel):
    """Professional modality update schema."""

    modality_id: Optional[uuid.UUID] = None
    modality_name: Optional[str] = None
    description: Optional[str] = None
    virtual_price: Optional[int] = None
    presencial_price: Optional[int] = None
    offers_presencial: Optional[bool] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class ProfessionalModalityResponse(ProfessionalModalityBase):
    """Professional modality response schema."""

    id: uuid.UUID
    professional_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
