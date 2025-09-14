"""
Professional Specialty New schemas.
"""
from typing import Optional
from pydantic import BaseModel
import uuid


class ProfessionalSpecialtyBase(BaseModel):
    """Base professional specialty schema."""
    specialty_id: str


class ProfessionalSpecialtyCreate(ProfessionalSpecialtyBase):
    """Professional specialty creation schema."""
    professional_id: str


class ProfessionalSpecialtyUpdate(BaseModel):
    """Professional specialty update schema."""
    specialty_id: Optional[str] = None


class ProfessionalSpecialtyResponse(ProfessionalSpecialtyBase):
    """Professional specialty response schema."""
    id: uuid.UUID
    professional_id: uuid.UUID
    
    class Config:
        from_attributes = True
