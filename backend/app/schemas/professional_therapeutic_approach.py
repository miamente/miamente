"""
Professional Therapeutic Approach schemas.
"""
from typing import Optional
from pydantic import BaseModel
import uuid


class ProfessionalTherapeuticApproachBase(BaseModel):
    """Base professional therapeutic approach schema."""
    therapeutic_approach_id: str


class ProfessionalTherapeuticApproachCreate(ProfessionalTherapeuticApproachBase):
    """Professional therapeutic approach creation schema."""
    professional_id: str


class ProfessionalTherapeuticApproachUpdate(BaseModel):
    """Professional therapeutic approach update schema."""
    therapeutic_approach_id: Optional[str] = None


class ProfessionalTherapeuticApproachResponse(ProfessionalTherapeuticApproachBase):
    """Professional therapeutic approach response schema."""
    id: uuid.UUID
    professional_id: uuid.UUID
    
    class Config:
        from_attributes = True
