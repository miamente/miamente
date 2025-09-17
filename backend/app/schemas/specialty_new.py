"""
New Specialty schemas.
"""
from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid


class SpecialtyBase(BaseModel):
    """Base specialty schema."""
    name: str
    category: Optional[str] = None


class SpecialtyCreate(SpecialtyBase):
    """Specialty creation schema."""
    pass


class SpecialtyUpdate(BaseModel):
    """Specialty update schema."""
    name: Optional[str] = None
    category: Optional[str] = None


class SpecialtyResponse(SpecialtyBase):
    """Specialty response schema."""
    id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)
