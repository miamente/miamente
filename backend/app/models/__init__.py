"""
Database models for the Miamente platform.
"""

# New unified account system models
from app.models.role import Role
from app.models.account import Account
from app.models.user_profile import UserProfile
from app.models.professional_profile import ProfessionalProfile

# Legacy models (to be deprecated)
from app.models.user import User
from app.models.professional import Professional

# Supporting models
from app.models.modality import Modality
from app.models.specialty import Specialty
from app.models.therapeutic_approach import TherapeuticApproach

# Junction table models (updated to use accounts)
from app.models.professional_modality import ProfessionalModality
from app.models.professional_specialty import ProfessionalSpecialty
from app.models.professional_therapeutic_approach import ProfessionalTherapeuticApproach

__all__ = [
    # New unified system
    "Role",
    "Account",
    "UserProfile",
    "ProfessionalProfile",
    # Legacy (to be deprecated)
    "User",
    "Professional",
    # Supporting models
    "Specialty",
    "Modality",
    "TherapeuticApproach",
    # Junction tables
    "ProfessionalSpecialty",
    "ProfessionalTherapeuticApproach",
    "ProfessionalModality",
]
