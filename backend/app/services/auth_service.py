"""
Authentication service.
"""
import uuid
from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_token_response,
    verify_token,
)
from app.models.user import User
from app.models.professional import Professional
from app.schemas.user import UserCreate, UserLogin
from app.schemas.professional import ProfessionalCreate, ProfessionalLogin


class AuthService:
    """Authentication service."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def authenticate_professional(self, email: str, password: str) -> Optional[Professional]:
        """Authenticate professional with email and password."""
        professional = self.db.query(Professional).filter(Professional.email == email).first()
        if not professional:
            return None
        if not verify_password(password, professional.hashed_password):
            return None
        return professional
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create new user."""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            phone=user_data.phone,
            date_of_birth=user_data.date_of_birth,
            emergency_contact=user_data.emergency_contact,
            emergency_phone=user_data.emergency_phone,
            hashed_password=hashed_password,
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def create_professional(self, professional_data: ProfessionalCreate) -> Professional:
        """Create new professional."""
        # Check if professional already exists
        existing_professional = self.db.query(Professional).filter(
            Professional.email == professional_data.email
        ).first()
        if existing_professional:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new professional
        hashed_password = get_password_hash(professional_data.password)
        db_professional = Professional(
            email=professional_data.email,
            full_name=professional_data.full_name,
            phone=professional_data.phone,
            specialty=professional_data.specialty,
            license_number=professional_data.license_number,
            years_experience=professional_data.years_experience,
            rate_cents=professional_data.rate_cents,
            currency=professional_data.currency,
            bio=professional_data.bio,
            certifications=professional_data.certifications,
            languages=professional_data.languages,
            therapy_approaches=professional_data.therapy_approaches,
            timezone=professional_data.timezone,
            emergency_contact=professional_data.emergency_contact,
            emergency_phone=professional_data.emergency_phone,
            hashed_password=hashed_password,
        )
        
        self.db.add(db_professional)
        self.db.commit()
        self.db.refresh(db_professional)
        return db_professional
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return None
        return self.db.query(User).filter(User.id == user_uuid).first()
    
    def get_professional_by_id(self, professional_id: str) -> Optional[Professional]:
        """Get professional by ID."""
        try:
            professional_uuid = uuid.UUID(professional_id)
        except ValueError:
            return None
        return self.db.query(Professional).filter(Professional.id == professional_uuid).first()
    
    def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from token."""
        user_id = verify_token(token)
        if user_id is None:
            return None
        return self.get_user_by_id(user_id)
    
    def get_current_professional(self, token: str) -> Optional[Professional]:
        """Get current professional from token."""
        professional_id = verify_token(token)
        if professional_id is None:
            return None
        return self.get_professional_by_id(professional_id)
