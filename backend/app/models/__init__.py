"""
Database models for the Miamente platform.
"""

from app.models.availability import Availability
from app.models.modality import Modality  # New: intervention modalities
from app.models.professional import Professional
from app.models.professional_modality import ProfessionalModality
from app.models.professional_specialty import (  # Keep for backward compatibility
    ProfessionalSpecialty,
)
from app.models.professional_specialty_new import (
    ProfessionalSpecialty as ProfessionalSpecialtyNew,  # New: many-to-many specialties
)
from app.models.professional_therapeutic_approach import ProfessionalTherapeuticApproach
from app.models.specialty import Specialty  # Keep for backward compatibility
from app.models.specialty_new import (
    Specialty as SpecialtyNew,  # New: specialties without price/description
)
from app.models.therapeutic_approach import (  # New: therapeutic approaches
    TherapeuticApproach,
)
from app.models.user import User

__all__ = [
    "User",
    "Professional",
    "Availability",
    "Specialty",
    "ProfessionalSpecialty",
    "Modality",
    "TherapeuticApproach",
    "SpecialtyNew",
    "ProfessionalSpecialtyNew",
    "ProfessionalTherapeuticApproach",
    "ProfessionalModality",
]
