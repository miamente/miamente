"""
Professional endpoints.
"""

import json
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.utils.auth import get_current_user_id
from app.core.database import get_db
from app.models.professional import Professional
from app.models.professional_modality import ProfessionalModality
from app.schemas.professional import ProfessionalResponse, ProfessionalUpdate
from app.services.auth_service import AuthService
from app.utils.parsers import parse_professional_data

router = APIRouter()

# Constants
PROFESSIONAL_NOT_FOUND_MESSAGE = "Professional not found"

# Fields that require special handling
JSON_FIELDS = ["academic_experience", "work_experience", "certifications"]
SPECIAL_FIELDS = ["specialty_ids", "therapy_approaches_ids", "modalities"]


@router.get("/", response_model=List[ProfessionalResponse])
async def get_professionals(
    *,
    skip: int = 0,
    limit: int = 100,
    specialty: str = None,
    min_rate_cents: int = None,
    max_rate_cents: int = None,
    db: Session = Depends(get_db),
):
    """Get all active professionals with optional filtering."""
    query = db.query(Professional).filter(Professional.is_active)

    # Apply filters
    query = _apply_professional_filters(query, specialty, min_rate_cents, max_rate_cents)

    professionals = query.offset(skip).limit(limit).all()

    # Parse JSON fields for each professional
    return [parse_professional_data(professional) for professional in professionals]


def _apply_professional_filters(query, specialty, min_rate_cents, max_rate_cents):
    """Apply filtering parameters to the professionals query."""
    # Filter by specialty if provided
    if specialty:
        query = query.filter(Professional.specialty.ilike(f"%{specialty}%"))

    # Filter by rate range if provided
    if min_rate_cents is not None:
        query = query.filter(Professional.rate_cents >= min_rate_cents)

    if max_rate_cents is not None:
        query = query.filter(Professional.rate_cents <= max_rate_cents)

    return query


@router.get("/{professional_id}", response_model=ProfessionalResponse)
async def get_professional(professional_id: str, db: Session = Depends(get_db)):
    """Get professional by ID."""
    try:
        professional_uuid = uuid.UUID(professional_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID format") from exc

    professional = db.query(Professional).filter(Professional.id == professional_uuid, Professional.is_active).first()

    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=PROFESSIONAL_NOT_FOUND_MESSAGE)

    return parse_professional_data(professional)


@router.get("/me/profile", response_model=ProfessionalResponse)
async def get_current_professional(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
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
    except Exception as exc:  # pylint: disable=broad-exception-caught
        print(f"DEBUG: Error during commit: {str(exc)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating professional: {str(exc)}",
        ) from exc


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

    # Handle modalities - update professional modalities
    if "modalities" in update_data:
        _update_modalities(professional, update_data, db)

    # Update other fields
    for field, value in update_data.items():
        if field not in SPECIAL_FIELDS and field not in JSON_FIELDS:
            setattr(professional, field, value)

    try:
        db.commit()
        db.refresh(professional)
        return parse_professional_data(professional)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating professional: {str(exc)}",
        ) from exc
