"""
Professional Specialties endpoints.
"""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_id
from app.core.database import get_db
from app.models.professional import Professional
from app.models.professional_specialty import ProfessionalSpecialty
from app.models.specialty import Specialty
from app.schemas.professional_specialty import (
    ProfessionalSpecialtyCreate,
    ProfessionalSpecialtyResponse,
    ProfessionalSpecialtyUpdate,
    ProfessionalSpecialtyWithDefault,
)

router = APIRouter()


@router.get("/debug")
async def debug_professional_specialties(
    current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    """Debug endpoint to check user and database connection."""
    try:
        user_uuid = uuid.UUID(current_user_id)

        # Check if user exists
        professional = db.query(Professional).filter(Professional.id == user_uuid).first()

        # Check if there are any professional specialties
        specialties_count = (
            db.query(ProfessionalSpecialty).filter(ProfessionalSpecialty.professional_id == user_uuid).count()
        )

        return {
            "user_id": current_user_id,
            "user_uuid": str(user_uuid),
            "professional_exists": professional is not None,
            "professional_id": str(professional.id) if professional else None,
            "specialties_count": specialties_count,
        }
    except Exception as e:
        return {"error": str(e), "user_id": current_user_id, "type": type(e).__name__}


@router.get("/")
async def get_professional_specialties(
    current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    """Get all specialties for the current professional."""
    try:
        # Convert string to UUID
        user_uuid = uuid.UUID(current_user_id)

        # Verify user is a professional
        professional = db.query(Professional).filter(Professional.id == user_uuid).first()
        if not professional:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Professional not found")

        # Get professional specialties with default specialty info
        specialties = (
            db.query(ProfessionalSpecialty)
            .filter(
                ProfessionalSpecialty.professional_id == user_uuid,
                ProfessionalSpecialty.is_active,
            )
            .all()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {str(e)}",
        )

    # Return simple list of specialties as dictionaries
    result = []
    for specialty in specialties:
        result.append(
            {
                "id": str(specialty.id),
                "professional_id": str(specialty.professional_id),
                "specialty_id": (str(specialty.specialty_id) if specialty.specialty_id else None),
                "name": specialty.name,
                "description": specialty.description,
                "price_cents": specialty.price_cents,
                "currency": specialty.currency,
                "is_default": specialty.is_default,
                "is_active": specialty.is_active,
                "created_at": specialty.created_at,
                "updated_at": specialty.updated_at,
            }
        )

    return result


@router.post("/")
async def create_professional_specialty(
    specialty_data: ProfessionalSpecialtyCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new specialty for the current professional."""
    # Verify user is a professional
    professional = db.query(Professional).filter(Professional.id == current_user_id).first()
    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Professional not found")

    # If specialty_id is provided, verify it exists and get default info
    default_specialty = None
    if specialty_data.specialty_id:
        try:
            specialty_uuid = uuid.UUID(specialty_data.specialty_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid specialty ID format",
            )

        default_specialty = db.query(Specialty).filter(Specialty.id == specialty_uuid).first()
        if not default_specialty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Default specialty not found",
            )

        # Check if this specialty is already assigned to the professional
        existing_assignment = (
            db.query(ProfessionalSpecialty)
            .filter(
                ProfessionalSpecialty.professional_id == current_user_id,
                ProfessionalSpecialty.specialty_id == specialty_uuid,
                ProfessionalSpecialty.is_active,
            )
            .first()
        )

        if existing_assignment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(f"Specialty '{default_specialty.name}' is already assigned to this professional"),
            )

    # If this specialty is being marked as default, remove default status from other specialties
    if specialty_data.is_default:
        # Remove default status from all other specialties for this professional
        db.query(ProfessionalSpecialty).filter(
            ProfessionalSpecialty.professional_id == current_user_id,
            ProfessionalSpecialty.is_active,
            ProfessionalSpecialty.is_default,
        ).update({"is_default": False})
        db.commit()

    # Create professional specialty
    try:
        user_uuid = uuid.UUID(current_user_id)
        specialty_uuid = uuid.UUID(specialty_data.specialty_id) if specialty_data.specialty_id else None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid UUID format: {str(e)}",
        )

    db_specialty = ProfessionalSpecialty(
        professional_id=user_uuid,
        specialty_id=specialty_uuid,
        name=specialty_data.name,
        description=specialty_data.description,
        price_cents=specialty_data.price_cents,
        currency=specialty_data.currency,
        is_default=specialty_data.is_default,
        is_active=specialty_data.is_active,
    )

    db.add(db_specialty)
    db.commit()
    db.refresh(db_specialty)

    return db_specialty


@router.get("/{specialty_id}", response_model=ProfessionalSpecialtyWithDefault)
async def get_professional_specialty(
    specialty_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a specific specialty for the current professional."""
    try:
        specialty_uuid = uuid.UUID(specialty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid specialty ID format",
        )

    specialty = (
        db.query(ProfessionalSpecialty)
        .filter(
            ProfessionalSpecialty.id == specialty_uuid,
            ProfessionalSpecialty.professional_id == current_user_id,
        )
        .first()
    )

    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional specialty not found",
        )

    # Get default specialty info if applicable
    specialty_data = {
        "id": str(specialty.id),
        "professional_id": str(specialty.professional_id),
        "specialty_id": str(specialty.specialty_id) if specialty.specialty_id else None,
        "name": specialty.name,
        "description": specialty.description,
        "price_cents": specialty.price_cents,
        "currency": specialty.currency,
        "is_default_specialty": specialty.is_default_specialty,
        "is_active": specialty.is_active,
        "created_at": specialty.created_at,
        "updated_at": specialty.updated_at,
        "default_specialty_name": None,
        "default_specialty_description": None,
        "default_specialty_price_cents": None,
    }

    if specialty.specialty_id:
        default_specialty = db.query(Specialty).filter(Specialty.id == specialty.specialty_id).first()
        if default_specialty:
            specialty_data["default_specialty_name"] = default_specialty.name
            specialty_data["default_specialty_description"] = default_specialty.description
            specialty_data["default_specialty_price_cents"] = default_specialty.default_price_cents

    return ProfessionalSpecialtyWithDefault(**specialty_data)


@router.put("/{specialty_id}", response_model=ProfessionalSpecialtyResponse)
async def update_professional_specialty(
    specialty_id: str,
    specialty_update: ProfessionalSpecialtyUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update a specialty for the current professional."""
    try:
        specialty_uuid = uuid.UUID(specialty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid specialty ID format",
        )

    specialty = (
        db.query(ProfessionalSpecialty)
        .filter(
            ProfessionalSpecialty.id == specialty_uuid,
            ProfessionalSpecialty.professional_id == current_user_id,
        )
        .first()
    )

    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional specialty not found",
        )

    # If this specialty is being marked as default, remove default status from other specialties
    update_data = specialty_update.dict(exclude_unset=True)
    if update_data.get("is_default") is True:
        # Remove default status from all other specialties for this professional
        db.query(ProfessionalSpecialty).filter(
            ProfessionalSpecialty.professional_id == current_user_id,
            ProfessionalSpecialty.is_active,
            ProfessionalSpecialty.id != specialty_uuid,
            ProfessionalSpecialty.is_default,
        ).update({"is_default": False})
        db.commit()

    # Update specialty fields
    for field, value in update_data.items():
        setattr(specialty, field, value)

    db.commit()
    db.refresh(specialty)

    return specialty


@router.delete("/{specialty_id}")
async def delete_professional_specialty(
    specialty_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete (deactivate) a specialty for the current professional."""
    try:
        specialty_uuid = uuid.UUID(specialty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid specialty ID format",
        )

    specialty = (
        db.query(ProfessionalSpecialty)
        .filter(
            ProfessionalSpecialty.id == specialty_uuid,
            ProfessionalSpecialty.professional_id == current_user_id,
        )
        .first()
    )

    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional specialty not found",
        )

    # Soft delete by setting is_active to False
    specialty.is_active = False
    db.commit()

    return {"message": "Professional specialty deleted successfully"}


@router.get("/available/defaults", response_model=List[dict])
async def get_available_default_specialties(
    current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    """Get default specialties that the professional hasn't added yet."""
    # Get all default specialties
    all_defaults = db.query(Specialty).all()

    # Get specialties already added by this professional
    added_specialty_ids = (
        db.query(ProfessionalSpecialty.specialty_id)
        .filter(
            ProfessionalSpecialty.professional_id == current_user_id,
            ProfessionalSpecialty.is_active,
            ProfessionalSpecialty.specialty_id.isnot(None),
        )
        .all()
    )

    added_ids = {str(specialty_id[0]) for specialty_id in added_specialty_ids}

    # Return only specialties not yet added
    available = []
    for specialty in all_defaults:
        if str(specialty.id) not in added_ids:
            available.append(
                {
                    "id": str(specialty.id),
                    "name": specialty.name,
                    "description": specialty.description,
                    "default_price_cents": specialty.default_price_cents,
                    "currency": specialty.currency,
                    "category": specialty.category,
                }
            )

    return available
