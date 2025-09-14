"""
Database models for the Miamente platform.
"""
from app.models.user import User
from app.models.professional import Professional
from app.models.appointment import Appointment
from app.models.availability import Availability
from app.models.payment import Payment
from app.models.specialty import Specialty  # Keep for backward compatibility
from app.models.professional_specialty import ProfessionalSpecialty  # Keep for backward compatibility
from app.models.modality import Modality  # New: intervention modalities
from app.models.therapeutic_approach import TherapeuticApproach  # New: therapeutic approaches
from app.models.specialty_new import Specialty as SpecialtyNew  # New: specialties without price/description
from app.models.professional_specialty_new import ProfessionalSpecialty as ProfessionalSpecialtyNew  # New: many-to-many specialties
from app.models.professional_therapeutic_approach import ProfessionalTherapeuticApproach
from app.models.professional_modality import ProfessionalModality

__all__ = [
    "User",
    "Professional", 
    "Appointment",
    "Availability",
    "Payment",
    "Specialty",
    "ProfessionalSpecialty",
    "Modality",
    "TherapeuticApproach", 
    "SpecialtyNew",
    "ProfessionalSpecialtyNew",
    "ProfessionalTherapeuticApproach",
    "ProfessionalModality",
]
