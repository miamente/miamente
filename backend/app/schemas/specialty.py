"""
Specialty schemas for the Miamente platform.
"""
from typing import Optional
from pydantic import BaseModel


class SpecialtyBase(BaseModel):
    """Base specialty schema."""
    name: str
    description: str
    default_price_cents: int
    currency: str = "COP"
    category: str


class SpecialtyCreate(SpecialtyBase):
    """Specialty creation schema."""
    pass


class SpecialtyUpdate(BaseModel):
    """Specialty update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    default_price_cents: Optional[int] = None
    currency: Optional[str] = None
    category: Optional[str] = None


class SpecialtyResponse(SpecialtyBase):
    """Specialty response schema."""
    id: str
    
    class Config:
        from_attributes = True


class ProfessionalSpecialtyUpdate(BaseModel):
    """Professional specialty update schema."""
    specialty_id: str
    custom_price_cents: Optional[int] = None
