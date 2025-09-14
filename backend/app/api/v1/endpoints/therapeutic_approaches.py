"""
Therapeutic approach endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.therapeutic_approach_service import TherapeuticApproachService
from app.schemas.therapeutic_approach import TherapeuticApproachResponse, TherapeuticApproachCreate, TherapeuticApproachUpdate

router = APIRouter()


@router.get("/", response_model=List[TherapeuticApproachResponse])
def get_therapeutic_approaches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all therapeutic approaches."""
    service = TherapeuticApproachService(db)
    approaches = service.get_therapeutic_approaches(skip=skip, limit=limit)
    return approaches


@router.get("/category/{category}", response_model=List[TherapeuticApproachResponse])
def get_therapeutic_approaches_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    """Get therapeutic approaches by category."""
    service = TherapeuticApproachService(db)
    approaches = service.get_therapeutic_approaches_by_category(category)
    return approaches


@router.get("/{approach_id}", response_model=TherapeuticApproachResponse)
def get_therapeutic_approach(
    approach_id: str,
    db: Session = Depends(get_db)
):
    """Get a therapeutic approach by ID."""
    service = TherapeuticApproachService(db)
    approach = service.get_therapeutic_approach(approach_id)
    if not approach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapeutic approach not found"
        )
    return approach


@router.post("/", response_model=TherapeuticApproachResponse)
def create_therapeutic_approach(
    approach: TherapeuticApproachCreate,
    db: Session = Depends(get_db)
):
    """Create a new therapeutic approach."""
    service = TherapeuticApproachService(db)
    return service.create_therapeutic_approach(approach)


@router.put("/{approach_id}", response_model=TherapeuticApproachResponse)
def update_therapeutic_approach(
    approach_id: str,
    approach_update: TherapeuticApproachUpdate,
    db: Session = Depends(get_db)
):
    """Update a therapeutic approach."""
    service = TherapeuticApproachService(db)
    approach = service.update_therapeutic_approach(approach_id, approach_update)
    if not approach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapeutic approach not found"
        )
    return approach


@router.delete("/{approach_id}")
def delete_therapeutic_approach(
    approach_id: str,
    db: Session = Depends(get_db)
):
    """Delete a therapeutic approach."""
    service = TherapeuticApproachService(db)
    success = service.delete_therapeutic_approach(approach_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapeutic approach not found"
        )
    return {"message": "Therapeutic approach deleted successfully"}
