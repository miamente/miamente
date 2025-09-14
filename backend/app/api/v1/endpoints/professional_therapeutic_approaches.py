"""
Professional therapeutic approach endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.professional_therapeutic_approach_service import ProfessionalTherapeuticApproachService
from app.schemas.professional_therapeutic_approach import ProfessionalTherapeuticApproachResponse, ProfessionalTherapeuticApproachCreate, ProfessionalTherapeuticApproachUpdate

router = APIRouter()


@router.get("/professional/{professional_id}", response_model=List[ProfessionalTherapeuticApproachResponse])
def get_professional_therapeutic_approaches(
    professional_id: str,
    db: Session = Depends(get_db)
):
    """Get all therapeutic approaches for a professional."""
    service = ProfessionalTherapeuticApproachService(db)
    approaches = service.get_professional_therapeutic_approaches(professional_id)
    return approaches


@router.get("/{approach_id}", response_model=ProfessionalTherapeuticApproachResponse)
def get_professional_therapeutic_approach(
    approach_id: str,
    db: Session = Depends(get_db)
):
    """Get a professional therapeutic approach by ID."""
    service = ProfessionalTherapeuticApproachService(db)
    approach = service.get_professional_therapeutic_approach(approach_id)
    if not approach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional therapeutic approach not found"
        )
    return approach


@router.post("/", response_model=ProfessionalTherapeuticApproachResponse)
def create_professional_therapeutic_approach(
    approach: ProfessionalTherapeuticApproachCreate,
    db: Session = Depends(get_db)
):
    """Create a new professional therapeutic approach."""
    service = ProfessionalTherapeuticApproachService(db)
    return service.create_professional_therapeutic_approach(approach)


@router.put("/{approach_id}", response_model=ProfessionalTherapeuticApproachResponse)
def update_professional_therapeutic_approach(
    approach_id: str,
    approach_update: ProfessionalTherapeuticApproachUpdate,
    db: Session = Depends(get_db)
):
    """Update a professional therapeutic approach."""
    service = ProfessionalTherapeuticApproachService(db)
    approach = service.update_professional_therapeutic_approach(approach_id, approach_update)
    if not approach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional therapeutic approach not found"
        )
    return approach


@router.delete("/{approach_id}")
def delete_professional_therapeutic_approach(
    approach_id: str,
    db: Session = Depends(get_db)
):
    """Delete a professional therapeutic approach."""
    service = ProfessionalTherapeuticApproachService(db)
    success = service.delete_professional_therapeutic_approach(approach_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional therapeutic approach not found"
        )
    return {"message": "Professional therapeutic approach deleted successfully"}


@router.put("/professional/{professional_id}/approaches")
def update_professional_therapeutic_approaches(
    professional_id: str,
    approach_ids: List[str],
    db: Session = Depends(get_db)
):
    """Update therapeutic approaches for a professional."""
    service = ProfessionalTherapeuticApproachService(db)
    approaches = service.add_therapeutic_approaches_to_professional(professional_id, approach_ids)
    return {"message": f"Updated {len(approaches)} therapeutic approaches for professional"}
