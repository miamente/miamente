"""
Mixin classes for common model functionality.

This module provides reusable mixins that can be used across different model classes
to avoid code duplication and maintain consistency.
"""

import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID


class TimestampMixin:
    """
    Mixin class providing common timestamp fields for database models.

    This mixin adds created_at and updated_at timestamp fields with proper
    timezone support and SQL defaults to avoid pylint E1102 warnings.
    """

    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )


class BaseNamedModelMixin:
    """
    Mixin class providing common fields for named models.

    This mixin adds common fields like id, name, and category that are shared
    across multiple model classes to avoid code duplication.
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100), nullable=True)  # Optional category grouping

    def __repr__(self) -> str:
        """Return a string representation of the model instance."""
        return f"<{self.__class__.__name__}(id={self.id}, name={self.name})>"


class BaseJunctionModelMixin:
    """
    Mixin class providing common fields for junction table models.

    This mixin adds common fields like id and professional_id that are shared
    across junction table model classes to avoid code duplication.
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
