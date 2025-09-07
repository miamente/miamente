"""
Test-specific auth service that uses test models.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import (
    verify_password,
    get_password_hash,
    create_token_response,
    verify_token,
)
from tests.conftest import UserModel, ProfessionalModel
from app.schemas.user import UserCreate, UserLogin
from app.schemas.professional import ProfessionalCreate, ProfessionalLogin


class TestAuthService:
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
    
    def authenticate_professional(self, email: str, password: str) -> Optional[ProfessionalModel]:
        """Authenticate professional with email and password."""
        professional = self.db.query(ProfessionalModel).filter(ProfessionalModel.email == email).first()
        if not professional:
            return None
        if not verify_password(password, professional.hashed_password):
            return None
        return professional
    
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
    
    def create_professional(self, professional_data: ProfessionalCreate) -> ProfessionalModel:
        """Create new professional."""
        # Check if professional already exists
        existing_professional = self.db.query(ProfessionalModel).filter(
            ProfessionalModel.email == professional_data.email
        ).first()
        if existing_professional:
            raise ValueError("Email already registered")
        
        # Create new professional
        hashed_password = get_password_hash(professional_data.password)
        db_professional = ProfessionalModel(
            email=professional_data.email,
            full_name=professional_data.full_name,
            phone=professional_data.phone,
            specialty=professional_data.specialty,
            license_number=professional_data.license_number,
            years_experience=professional_data.years_experience,
            rate_cents=professional_data.rate_cents,
            currency=professional_data.currency,
            bio=professional_data.bio,
            education=professional_data.education,
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
    
    def get_user_by_id(self, user_id: str) -> Optional[UserModel]:
        """Get user by ID."""
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()
    
    def get_professional_by_id(self, professional_id: str) -> Optional[ProfessionalModel]:
        """Get professional by ID."""
        return self.db.query(ProfessionalModel).filter(ProfessionalModel.id == professional_id).first()
    
    def get_current_user(self, token: str) -> Optional[UserModel]:
        """Get current user from token."""
        user_id = verify_token(token)
        if user_id is None:
            return None
        return self.get_user_by_id(user_id)
    
    def get_current_professional(self, token: str) -> Optional[ProfessionalModel]:
        """Get current professional from token."""
        professional_id = verify_token(token)
        if professional_id is None:
            return None
        return self.get_professional_by_id(professional_id)
