"""
Professional Specialty schemas for the Miamente platform.
"""
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from uuid import UUID


class ProfessionalSpecialtyBase(BaseModel):
    """Base professional specialty schema."""
    name: str
    description: str
    price_cents: int
    currency: str = "COP"
    is_default: bool = False
    is_active: bool = True


class ProfessionalSpecialtyCreate(ProfessionalSpecialtyBase):
    """Professional specialty creation schema."""
    specialty_id: Optional[str] = None  # Reference to default specialty
    is_active: Optional[bool] = True  # Default to active


class ProfessionalSpecialtyUpdate(BaseModel):
    """Professional specialty update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class ProfessionalSpecialtyResponse(ProfessionalSpecialtyBase):
    """Professional specialty response schema."""
    id: str
    professional_id: str
    specialty_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_validator('id', 'professional_id', 'specialty_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v
    
    @field_validator('created_at', 'updated_at', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, str):
            # Handle timezone-aware datetime strings
            if v.endswith('-05') or v.endswith('+00'):
                # Remove timezone suffix for parsing
                v = v[:-3]
            try:
                return datetime.fromisoformat(v)
            except ValueError:
                # Simple fallback - just return the string and let Pydantic handle it
                return v
        return v
    
    model_config = ConfigDict(from_attributes=True)
class ProfessionalSpecialtyWithDefault(ProfessionalSpecialtyResponse):
    """Professional specialty with default specialty information."""
    default_specialty_name: Optional[str] = None
    default_specialty_description: Optional[str] = None
    default_specialty_price_cents: Optional[int] = None
