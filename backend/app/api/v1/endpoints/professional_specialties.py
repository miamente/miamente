"""
Professional specialty (new version) endpoints.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.professional_specialty import (
    ProfessionalSpecialtyCreate,
    ProfessionalSpecialtyResponse,
    ProfessionalSpecialtyUpdate,
)
from app.services.professional_specialty_service import (
    ProfessionalSpecialtyService,
)

router = APIRouter()


@router.get(
    "/professional/{professional_id}",
    response_model=List[ProfessionalSpecialtyResponse],
)
def get_professional_specialties(professional_id: str, db: Session = Depends(get_db)):
    """Get all specialties for a professional."""
    service = ProfessionalSpecialtyService(db)
    specialties = service.get_professional_specialties(professional_id)
    return specialties


@router.get("/{specialty_id}", response_model=ProfessionalSpecialtyResponse)
def get_professional_specialty(specialty_id: str, db: Session = Depends(get_db)):
    """Get a professional specialty by ID."""
    service = ProfessionalSpecialtyService(db)
    specialty = service.get_professional_specialty(specialty_id)
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional specialty not found",
        )
    return specialty


@router.post("/", response_model=ProfessionalSpecialtyResponse)
def create_professional_specialty(specialty: ProfessionalSpecialtyCreate, db: Session = Depends(get_db)):
    """Create a new professional specialty."""
    service = ProfessionalSpecialtyService(db)
    return service.create_professional_specialty(specialty)


@router.put("/{specialty_id}", response_model=ProfessionalSpecialtyResponse)
def update_professional_specialty(
    specialty_id: str,
    specialty_update: ProfessionalSpecialtyUpdate,
    db: Session = Depends(get_db),
):
    """Update a professional specialty."""
    service = ProfessionalSpecialtyService(db)
    specialty = service.update_professional_specialty(specialty_id, specialty_update)
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional specialty not found",
        )
    return specialty


@router.delete("/{specialty_id}")
def delete_professional_specialty(specialty_id: str, db: Session = Depends(get_db)):
    """Delete a professional specialty."""
    service = ProfessionalSpecialtyService(db)
    success = service.delete_professional_specialty(specialty_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional specialty not found",
        )
    return {"message": "Professional specialty deleted successfully"}


@router.put("/professional/{professional_id}/specialties")
def update_professional_specialties(professional_id: str, specialty_ids: List[str], db: Session = Depends(get_db)):
    """Update specialties for a professional."""
    service = ProfessionalSpecialtyService(db)
    specialties = service.add_specialties_to_professional(professional_id, specialty_ids)
    return {"message": f"Updated {len(specialties)} specialties for professional"}
