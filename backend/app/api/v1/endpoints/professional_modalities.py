"""
Professional modality endpoints.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.professional_modality import (
    ProfessionalModalityCreate,
    ProfessionalModalityResponse,
    ProfessionalModalityUpdate,
)
from app.services.professional_modality_service import ProfessionalModalityService

router = APIRouter()


@router.get(
    "/professional/{professional_id}", response_model=List[ProfessionalModalityResponse]
)
def get_professional_modalities(professional_id: str, db: Session = Depends(get_db)):
    """Get all modalities for a professional."""
    service = ProfessionalModalityService(db)
    modalities = service.get_professional_modalities(professional_id)
    return modalities


@router.get(
    "/professional/{professional_id}/default",
    response_model=ProfessionalModalityResponse,
)
def get_default_professional_modality(
    professional_id: str, db: Session = Depends(get_db)
):
    """Get the default modality for a professional."""
    service = ProfessionalModalityService(db)
    modality = service.get_default_professional_modality(professional_id)
    if not modality:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No default modality found for this professional",
        )
    return modality


@router.get("/{modality_id}", response_model=ProfessionalModalityResponse)
def get_professional_modality(modality_id: str, db: Session = Depends(get_db)):
    """Get a professional modality by ID."""
    service = ProfessionalModalityService(db)
    modality = service.get_professional_modality(modality_id)
    if not modality:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional modality not found",
        )
    return modality


@router.post("/", response_model=ProfessionalModalityResponse)
def create_professional_modality(
    modality: ProfessionalModalityCreate, db: Session = Depends(get_db)
):
    """Create a new professional modality."""
    service = ProfessionalModalityService(db)
    return service.create_professional_modality(modality)


@router.put("/{modality_id}", response_model=ProfessionalModalityResponse)
def update_professional_modality(
    modality_id: str,
    modality_update: ProfessionalModalityUpdate,
    db: Session = Depends(get_db),
):
    """Update a professional modality."""
    service = ProfessionalModalityService(db)
    modality = service.update_professional_modality(modality_id, modality_update)
    if not modality:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional modality not found",
        )
    return modality


@router.delete("/{modality_id}")
def delete_professional_modality(modality_id: str, db: Session = Depends(get_db)):
    """Delete a professional modality."""
    service = ProfessionalModalityService(db)
    success = service.delete_professional_modality(modality_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional modality not found",
        )
    return {"message": "Professional modality deleted successfully"}


@router.put("/{modality_id}/set-default")
def set_default_modality(modality_id: str, db: Session = Depends(get_db)):
    """Set a modality as default for a professional."""
    service = ProfessionalModalityService(db)

    # Get the modality to find the professional_id
    modality = service.get_professional_modality(modality_id)
    if not modality:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional modality not found",
        )

    success = service.set_default_modality(modality.professional_id, modality_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to set modality as default",
        )
    return {"message": "Modality set as default successfully"}
