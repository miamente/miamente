"""
Therapeutic Approach model - Defines theoretical and methodological currents in therapy.

This model represents the different therapeutic approaches available in the platform,
such as Cognitive Behavioral Therapy, Psychoanalysis, etc.
"""

from app.core.database import Base
from app.models.mixins import BaseNamedModelMixin, DescriptionMixin, TimestampMixin


class TherapeuticApproach(Base, BaseNamedModelMixin, DescriptionMixin, TimestampMixin):
    """Therapeutic Approach model - Theoretical and methodological currents."""

    __tablename__ = "therapeutic_approaches"
