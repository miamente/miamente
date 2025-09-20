"""
User endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.utils.auth import get_current_user_id
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import AuthService
from app.utils.parsers import parse_user_data

router = APIRouter()

# Error messages
USER_NOT_FOUND_MESSAGE = "User not found"




@router.get("/", response_model=list[UserResponse])
async def get_users(_db: Session = Depends(get_db)):
    """Get all users (admin only - for now returns 401)."""
    # For now, this endpoint requires authentication
    # In a real app, this would check for admin role
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, _db: Session = Depends(get_db)):
    """Get user by ID (admin only - for now returns 401)."""
    # For now, this endpoint requires authentication
    # In a real app, this would check for admin role
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get current user profile."""
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)

    return user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UserUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update current user profile."""
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)

    try:
        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user",
        ) from exc


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Delete current user account."""
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)

    try:
        # Soft delete - mark as inactive instead of hard delete
        user.is_active = False
        db.commit()
        return None

    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        ) from exc
