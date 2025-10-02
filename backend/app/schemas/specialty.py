"""
New Specialty schemas.
"""

import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class SpecialtyBase(BaseModel):
    """Base specialty schema."""

    name: str
    is_active: Optional[bool] = True
    description: Optional[str] = None


class SpecialtyCreate(SpecialtyBase):
    """Specialty creation schema."""


class SpecialtyUpdate(BaseModel):
    """Specialty update schema."""

    name: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class SpecialtyResponse(SpecialtyBase):
    """Specialty response schema."""

    id: uuid.UUID
    professional_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class PaginatedSpecialtiesResponse(BaseModel):
    """Paginated specialties response schema."""

    items: List[SpecialtyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
