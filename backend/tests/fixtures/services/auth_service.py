"""
Test-specific auth service that uses test models.
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import (
    verify_password,
    get_password_hash,
    # create_token_response,  # Unused import
    verify_token,
)
from app.models.user import User as UserModel
from app.schemas.user import UserCreate  # , UserLogin  # Unused import


class AuthService:
    """Test authentication service that uses test models."""

    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, email: str, password: str) -> Optional[UserModel]:
        """Authenticate user with email and password."""
        user = self.db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(self, user_data: UserCreate) -> UserModel:
        """Create new user."""
        # Check if user already exists
        existing_user = self.db.query(UserModel).filter(UserModel.email == user_data.email).first()
        if existing_user:
            raise ValueError("Email already registered")

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = UserModel(
            email=user_data.email,
            full_name=user_data.full_name,
            phone=user_data.phone,
            hashed_password=hashed_password,
        )

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_id(self, user_id: str) -> Optional[UserModel]:
        """Get user by ID."""
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def get_current_user(self, token: str) -> Optional[UserModel]:
        """Get current user from token."""
        user_id = verify_token(token)
        if user_id is None:
            return None
        return self.get_user_by_id(user_id)
