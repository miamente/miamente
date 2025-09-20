"""
Mixin classes for common model functionality.

This module provides reusable mixins that can be used across different model classes
to avoid code duplication and maintain consistency.
"""

from sqlalchemy import Column, DateTime, text


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
