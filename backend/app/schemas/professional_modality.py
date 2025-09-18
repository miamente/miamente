"""
Professional Modality schemas.
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid

class ProfessionalModalityBase(BaseModel):
    """Base professional modality schema."""

    modality_id: Optional[str] = None
    name: str
    description: str
    price_cents: int
    currency: str = "COP"
    is_default: bool = False
    is_active: bool = True

class ProfessionalModalityCreate(ProfessionalModalityBase):
    """Professional modality creation schema."""

    professional_id: str

class ProfessionalModalityUpdate(BaseModel):
    """Professional modality update schema."""

    modality_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    currency: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None

class ProfessionalModalityResponse(ProfessionalModalityBase):
    """Professional modality response schema."""

    id: uuid.UUID
    professional_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
