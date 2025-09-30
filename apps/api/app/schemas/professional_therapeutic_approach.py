"""
Professional Therapeutic Approach schemas.
"""

import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfessionalTherapeuticApproachBase(BaseModel):
    """Base professional therapeutic approach schema."""

    therapeutic_approach_id: uuid.UUID


class ProfessionalTherapeuticApproachCreate(ProfessionalTherapeuticApproachBase):
    """Professional therapeutic approach creation schema."""

    professional_id: str


class ProfessionalTherapeuticApproachUpdate(BaseModel):
    """Professional therapeutic approach update schema."""

    therapeutic_approach_id: Optional[uuid.UUID] = None


class ProfessionalTherapeuticApproachResponse(ProfessionalTherapeuticApproachBase):
    """Professional therapeutic approach response schema."""

    id: uuid.UUID
    professional_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
