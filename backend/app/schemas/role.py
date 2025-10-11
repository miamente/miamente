"""
Role schemas for the Miamente platform.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class RoleBase(BaseModel):
    """Base role schema."""

    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    """Role creation schema."""


class RoleUpdate(BaseModel):
    """Role update schema."""

    name: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(RoleBase):
    """Role response schema."""

    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
