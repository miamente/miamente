"""
User endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_id
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth_service import AuthService

router = APIRouter()


def parse_user_data(user: User) -> dict:
    """Parse user data for API response."""
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "profile_picture": user.profile_picture,
        "date_of_birth": user.date_of_birth,
        "emergency_contact": user.emergency_contact,
        "emergency_phone": user.emergency_phone,
        "preferences": user.preferences,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


@router.get("/", response_model=list[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    """Get all users (admin only - for now returns 401)."""
    # For now, this endpoint requires authentication
    # In a real app, this would check for admin role
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user",
        )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Delete current user account."""
    auth_service = AuthService(db)
    user = auth_service.get_user_by_id(current_user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        # Soft delete - mark as inactive instead of hard delete
        user.is_active = False
        db.commit()
        return None

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user",
        )
