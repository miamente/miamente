"""
Data parsing utilities for API responses.
"""

import json
from app.models.professional import Professional
from app.models.user import User


def parse_professional_data(professional: Professional) -> dict:
    """Parse professional data including JSON fields."""
    print(f"DEBUG: Parsing professional data for {professional.id}")
    modalities_count = len(professional.professional_modalities) if professional.professional_modalities else 0
    print(f"DEBUG: Professional modalities count: {modalities_count}")
    if professional.professional_modalities:
        for pmod in professional.professional_modalities:
            print(f"DEBUG: Modality: {pmod.modality_name}, Active: {pmod.is_active}")

    return {
        "id": professional.id,
        "email": professional.email,
        "full_name": professional.full_name,
        "phone_country_code": professional.phone_country_code,
        "phone_number": professional.phone_number,
        "license_number": professional.license_number,
        "years_experience": professional.years_experience,
        "rate_cents": professional.rate_cents,
        "currency": professional.currency,
        "professional_specialties": [
            {
                "id": str(ps.id),
                "name": ps.specialty.name if ps.specialty else "Unknown Specialty",
                "description": (ps.specialty.category if ps.specialty else "No description available"),
                "price_cents": professional.rate_cents,  # Use professional's rate
                "currency": professional.currency,
                "is_default": False,  # Determined by business logic
                "is_active": True,  # All specialties are considered active
            }
            for ps in professional.professional_specialties
            if ps.specialty
        ],
        "bio": professional.bio,
        "academic_experience": professional.academic_experience,
        "work_experience": professional.work_experience,
        "certifications": professional.certifications,
        "languages": professional.languages,
        "therapy_approaches_ids": professional.therapy_approaches_ids,
        "specialty_ids": professional.specialty_ids,
        "modalities": [
            {
                "id": str(pmod.id),
                "modalityId": str(pmod.modality_id),
                "modalityName": pmod.modality_name,
                "virtualPrice": pmod.virtual_price,
                "presencialPrice": pmod.presencial_price,
                "offersPresencial": pmod.offers_presencial,
                "description": pmod.description,
                "isDefault": pmod.is_default,
            }
            for pmod in professional.professional_modalities
            if pmod.is_active
        ],
        "timezone": professional.timezone,
        "working_hours": (json.loads(professional.working_hours) if professional.working_hours else None),
        "profile_picture": professional.profile_picture,
        "is_active": professional.is_active,
        "is_verified": professional.is_verified,
        "created_at": professional.created_at,
        "updated_at": professional.updated_at,
    }


def parse_user_data(user: User) -> dict:
    """Parse user data for API responses."""
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "profile_picture": user.profile_picture,
        "date_of_birth": user.date_of_birth,
        "emergency_contact": user.emergency_contact,
        "emergency_phone": user.emergency_phone,
        "preferences": user.preferences,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
