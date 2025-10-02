"""
Data parsing utilities for API responses.
"""

import json
from app.models.professional import Professional
from app.models.user import User


def _parse_json_field(field_value: str) -> list:
    """Parse a JSON field safely, returning an empty list if invalid."""
    if not field_value:
        return []
    try:
        parsed = json.loads(field_value)
        return parsed if isinstance(parsed, list) else []
    except json.JSONDecodeError:
        return []


def _parse_certifications(certifications_field) -> list:
    """Parse certifications field, handling both list and JSON string formats."""
    if not certifications_field:
        return []
    try:
        if isinstance(certifications_field, list):
            cert_data = certifications_field
        else:
            cert_data = json.loads(certifications_field)

        certifications = []
        if isinstance(cert_data, list):
            for cert in cert_data:
                if isinstance(cert, str):
                    certifications.append({"name": cert, "document_url": None})
                elif isinstance(cert, dict):
                    certifications.append(cert)
        elif isinstance(cert_data, dict):
            certifications = [cert_data]

        return certifications
    except (json.JSONDecodeError, TypeError):
        return []


def parse_professional_data(professional: Professional) -> dict:
    """Parse professional data including JSON fields."""
    print(f"DEBUG: Parsing professional data for {professional.id}")
    modalities_count = len(professional.professional_modalities) if professional.professional_modalities else 0
    print(f"DEBUG: Professional modalities count: {modalities_count}")
    if professional.professional_modalities:
        for pmod in professional.professional_modalities:
            print(f"DEBUG: Modality: {pmod.modality_name}, Active: {pmod.is_active}")

    # Parse JSON fields using helper functions
    academic_experience = _parse_json_field(professional.academic_experience)
    work_experience = _parse_json_field(professional.work_experience)
    certifications = _parse_certifications(professional.certifications)

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
                "description": (
                    ps.specialty.description
                    if ps.specialty and ps.specialty.description
                    else "No description available"
                ),
                "price_cents": professional.rate_cents,  # Use professional's rate
                "currency": professional.currency,
                "is_default": False,  # Determined by business logic
                "is_active": True,  # All specialties are considered active
            }
            for ps in professional.professional_specialties
            if ps.specialty
        ],
        "bio": professional.bio,
        "academic_experience": academic_experience,
        "work_experience": work_experience,
        "certifications": certifications,
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
        "role": user.role.value if user.role else "user",
        "profile_picture": user.profile_picture,
        "date_of_birth": user.date_of_birth,
        "emergency_contact": user.emergency_contact,
        "emergency_phone": user.emergency_phone,
        "preferences": user.preferences,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
