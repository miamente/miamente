"""
Professional endpoints.
"""

import json
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_id
from app.core.database import get_db
from app.models.professional import Professional
from app.models.professional_modality import ProfessionalModality
from app.schemas.professional import ProfessionalResponse, ProfessionalUpdate
from app.services.auth_service import AuthService

router = APIRouter()

# Constants
PROFESSIONAL_NOT_FOUND_MESSAGE = "Professional not found"

# Fields that require special handling
JSON_FIELDS = ["academic_experience", "work_experience", "certifications"]
SPECIAL_FIELDS = ["specialty_ids", "therapy_approaches_ids", "modalities"]


def parse_professional_data(professional: Professional) -> dict:
    """Parse professional data including JSON fields."""
    print(f"DEBUG: Parsing professional data for {professional.id}")
    modalities_count = len(professional.professional_modalities) if professional.professional_modalities else 0
    print(f"DEBUG: Professional modalities count: {modalities_count}")
    if professional.professional_modalities:
        for pm in professional.professional_modalities:
            print(f"DEBUG: Modality: {pm.modality_name}, Active: {pm.is_active}")

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
            if ps.specialty  # Only include if specialty exists
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
                "id": str(pm.id),
                "modalityId": str(pm.modality_id),
                "modalityName": pm.modality_name,
                "virtualPrice": pm.virtual_price,
                "presencialPrice": pm.presencial_price,
                "offersPresencial": pm.offers_presencial,
                "description": pm.description,
                "isDefault": pm.is_default,
            }
            for pm in professional.professional_modalities
            if pm.is_active
        ],
        "timezone": professional.timezone,
        "working_hours": (json.loads(professional.working_hours) if professional.working_hours else None),
        "profile_picture": professional.profile_picture,
        "is_active": professional.is_active,
        "is_verified": professional.is_verified,
        "created_at": professional.created_at,
        "updated_at": professional.updated_at,
    }


@router.get("/", response_model=List[ProfessionalResponse])
async def get_professionals(
    skip: int = 0,
    limit: int = 100,
    specialty: str = None,
    min_rate_cents: int = None,
    max_rate_cents: int = None,
    db: Session = Depends(get_db),
):
    """Get all active professionals with optional filtering."""
    query = db.query(Professional).filter(Professional.is_active)

    # Filter by specialty if provided
    if specialty:
        query = query.filter(Professional.specialty.ilike(f"%{specialty}%"))

    # Filter by rate range if provided
    if min_rate_cents is not None:
        query = query.filter(Professional.rate_cents >= min_rate_cents)

    if max_rate_cents is not None:
        query = query.filter(Professional.rate_cents <= max_rate_cents)

    professionals = query.offset(skip).limit(limit).all()

    # Parse JSON fields for each professional
    return [parse_professional_data(professional) for professional in professionals]


@router.get("/{professional_id}", response_model=ProfessionalResponse)
async def get_professional(professional_id: str, db: Session = Depends(get_db)):
    """Get professional by ID."""
    try:
        professional_uuid = uuid.UUID(professional_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID format")

    professional = db.query(Professional).filter(Professional.id == professional_uuid, Professional.is_active).first()

    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PROFESSIONAL_NOT_FOUND_MESSAGE)

    return parse_professional_data(professional)


@router.get("/me/profile", response_model=ProfessionalResponse)
async def get_current_professional(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get current professional profile."""
    auth_service = AuthService(db)
    professional = auth_service.get_professional_by_id(current_user_id)

    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PROFESSIONAL_NOT_FOUND_MESSAGE)

    return parse_professional_data(professional)


def _update_json_fields(professional: Professional, update_data: dict) -> None:
    """Update JSON fields in the professional model."""
    for field in JSON_FIELDS:
        if field in update_data:
            setattr(professional, field, json.dumps(update_data[field]))


def _update_modalities(professional: Professional, update_data: dict, db: Session) -> None:
    """Update professional modalities relationship."""
    if "modalities" not in update_data:
        return

    print(f"DEBUG: Processing modalities data: {update_data['modalities']}")

    # Remove existing modalities
    db.query(ProfessionalModality).filter(ProfessionalModality.professional_id == professional.id).delete()

    # Add new modalities
    for modality_data in update_data["modalities"]:
        print(f"DEBUG: Creating modality with data: {modality_data}")
        new_modality = ProfessionalModality(
            professional_id=professional.id,
            modality_id=uuid.UUID(modality_data["modalityId"]),
            modality_name=modality_data["modalityName"],
            virtual_price=modality_data["virtualPrice"],
            presencial_price=modality_data.get("presencialPrice", 0),
            offers_presencial=modality_data.get("offersPresencial", False),
            description=modality_data.get("description"),
            is_default=modality_data.get("isDefault", False),
        )
        db.add(new_modality)
        print(f"DEBUG: Added modality to database: {new_modality}")

    # Flush to ensure the modalities are saved before commit
    db.flush()
    print(f"DEBUG: Flushed {len(update_data['modalities'])} modalities to database")


def _update_other_fields(professional: Professional, update_data: dict) -> None:
    """Update other fields in the professional model."""
    excluded_fields = JSON_FIELDS + SPECIAL_FIELDS

    for field, value in update_data.items():
        if field not in excluded_fields and hasattr(professional, field):
            # Map hourly_rate_cents to rate_cents
            if field == "hourly_rate_cents":
                professional.rate_cents = value
            else:
                setattr(professional, field, value)


def _commit_changes(professional: Professional, db: Session) -> Professional:
    """Commit changes to database and refresh the professional."""
    try:
        print("DEBUG: Committing changes to database...")
        db.commit()
        print("DEBUG: Changes committed successfully")
        db.refresh(professional)
        print("DEBUG: Professional refreshed from database")

        # Explicitly reload the modalities relationship
        db.refresh(professional, ["professional_modalities"])
        modalities_count_after = (
            len(professional.professional_modalities) if professional.professional_modalities else 0
        )
        print(f"DEBUG: After refresh, modalities count: {modalities_count_after}")

        return professional
    except Exception as e:
        print(f"DEBUG: Error during commit: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating professional: {str(e)}",
        )


@router.put("/me", response_model=ProfessionalResponse)
async def update_current_professional(
    professional_update: ProfessionalUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update current professional profile."""
    auth_service = AuthService(db)
    professional = auth_service.get_professional_by_id(current_user_id)

    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PROFESSIONAL_NOT_FOUND_MESSAGE)

    # Update professional fields
    update_data = professional_update.dict(exclude_unset=True)

    # Handle different types of field updates
    _update_json_fields(professional, update_data)

    # Handle specialty_ids - update directly in the professional model
    if "specialty_ids" in update_data:
        professional.specialty_ids = update_data["specialty_ids"]

    # Handle therapy_approaches_ids - update directly in the professional model
    if "therapy_approaches_ids" in update_data:
        professional.therapy_approaches_ids = update_data["therapy_approaches_ids"]

    # Handle modalities - update professional_modalities relationship
    _update_modalities(professional, update_data, db)

    # Update other fields
    _update_other_fields(professional, update_data)

    # Commit changes and return updated professional
    return _commit_changes(professional, db)


@router.get("/me/appointments")
async def get_current_professional_appointments(
    current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    """Get current professional appointments."""
    # Appointment service will be implemented in a future release
    return {"message": "Appointment service not yet implemented", "appointments": []}
