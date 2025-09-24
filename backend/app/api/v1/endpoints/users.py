"""
User endpoints.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.utils.auth import get_current_user_id, get_current_admin_user
from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter()

# Error messages
USER_NOT_FOUND_MESSAGE = "User not found"


@router.get("/", response_model=list[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    _admin_user=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Get all users (admin only)."""
    user_service = UserService(db)
    users = user_service.get_users(skip=skip, limit=limit)

    # Filter by role if specified
    if role:
        users = [user for user in users if user.role.value == role]

    return users


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get current user profile."""
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)

    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: uuid.UUID,
    _admin_user=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Get user by ID (admin only)."""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)

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


@router.patch("/{user_id}/status", response_model=UserResponse)
async def toggle_user_status(
    user_id: str,
    status_data: dict,
    _admin_user=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Toggle user active status (admin only)."""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)

    try:
        user.is_active = status_data.get("is_active", user.is_active)
        db.commit()
        db.refresh(user)
        return user
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status",
        ) from exc


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_admin(
    user_id: str,
    _admin_user=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Delete user (admin only)."""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)

    try:
        # Soft delete - mark as inactive
        user.is_active = False
        db.commit()
        return None
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        ) from exc
