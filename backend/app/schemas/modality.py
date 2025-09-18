import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ModalityBase(BaseModel):
    """Base modality schema."""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, max_length=100)
    currency: str = Field(default="COP", max_length=3)
    default_price_cents: int = Field(default=0, ge=0)
    is_active: bool = True


class ModalityCreate(ModalityBase):
    """Schema for creating a modality."""


class ModalityUpdate(BaseModel):
    """Schema for updating a modality."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, max_length=100)
    currency: Optional[str] = Field(None, max_length=3)
    default_price_cents: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ModalityResponse(ModalityBase):
    """Schema for modality response."""

    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProfessionalModalityBase(BaseModel):
    """Base professional modality schema."""

    modality_id: uuid.UUID = Field(...)
    modality_name: str = Field(..., min_length=1, max_length=255)
    virtual_price: int = Field(..., ge=0)
    presencial_price: int = Field(default=0, ge=0)
    offers_presencial: bool = False
    description: Optional[str] = Field(None, max_length=1000)
    is_default: bool = False


class ProfessionalModalityCreate(ProfessionalModalityBase):
    """Schema for creating a professional modality."""


class ProfessionalModalityUpdate(BaseModel):
    """Schema for updating a professional modality."""

    modality_id: Optional[uuid.UUID] = None
    modality_name: Optional[str] = Field(None, min_length=1, max_length=255)
    virtual_price: Optional[int] = Field(None, ge=0)
    presencial_price: Optional[int] = Field(None, ge=0)
    offers_presencial: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=1000)
    is_default: Optional[bool] = None


class ProfessionalModalityResponse(ProfessionalModalityBase):
    """Schema for professional modality response."""

    id: uuid.UUID
    professional_id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
