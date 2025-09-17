"""
Therapeutic Approach schemas.
"""
from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid


class TherapeuticApproachBase(BaseModel):
    """Base therapeutic approach schema."""
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class TherapeuticApproachCreate(TherapeuticApproachBase):
    """Therapeutic approach creation schema."""
    pass


class TherapeuticApproachUpdate(BaseModel):
    """Therapeutic approach update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class TherapeuticApproachResponse(TherapeuticApproachBase):
    """Therapeutic approach response schema."""
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)
