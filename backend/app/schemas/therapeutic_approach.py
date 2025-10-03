"""
Therapeutic Approach schemas.
"""

import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class TherapeuticApproachBase(BaseModel):
    """Base therapeutic approach schema."""

    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class TherapeuticApproachCreate(TherapeuticApproachBase):
    """Therapeutic approach creation schema."""


class TherapeuticApproachUpdate(BaseModel):
    """Therapeutic approach update schema."""

    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class TherapeuticApproachResponse(TherapeuticApproachBase):
    """Therapeutic approach response schema."""

    id: uuid.UUID
    is_active: Optional[bool] = True

    model_config = ConfigDict(from_attributes=True)


class TherapeuticApproachWithCountResponse(BaseModel):
    """Therapeutic approach response with professional count for admin."""

    id: uuid.UUID
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    professional_count: int


class PaginatedTherapeuticApproachesResponse(BaseModel):
    """Paginated therapeutic approaches response schema."""

    items: List[TherapeuticApproachWithCountResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
