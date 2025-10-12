"""
Account service for managing unified accounts in the Miamente platform.
"""

import json
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_password_hash, verify_password
from app.models.account import Account
from app.models.role import Role
from app.models.user_profile import UserProfile
from app.models.professional_profile import ProfessionalProfile
from app.schemas.account import AccountUpdate


class AccountService:
    """Service for managing unified accounts."""

    def __init__(self, db: Session):
        self.db = db

    def authenticate(self, email: str, password: str) -> Optional[Account]:
        """Authenticate account with email and password."""
        account = self.db.query(Account).options(joinedload(Account.role)).filter(Account.email == email).first()

        if not account:
            return None

        if not verify_password(password, account.hashed_password):
            return None

        # Update last login
        account.last_login = datetime.utcnow()
        self.db.commit()
        self.db.refresh(account)

        return account

    def get_account_by_id(self, account_id: uuid.UUID) -> Optional[Account]:
        """Get account by ID with role loaded."""
        return self.db.query(Account).options(joinedload(Account.role)).filter(Account.id == account_id).first()

    def get_account_by_email(self, email: str) -> Optional[Account]:
        """Get account by email."""
        return self.db.query(Account).filter(Account.email == email).first()

    def get_account_with_profile(self, account_id: uuid.UUID) -> Optional[dict]:
        """Get account with its profile (user or professional)."""
        account = self.get_account_by_id(account_id)
        if not account:
            return None

        result = {"account": account, "role": account.role.name, "profile": None}

        # Convert SQLAlchemy models to dicts for Pydantic serialization
        if account.role.name in ("user", "admin"):
            if account.user_profile:
                result["profile"] = {
                    "account_id": str(account.user_profile.account_id),
                    "date_of_birth": (
                        account.user_profile.date_of_birth.isoformat() if account.user_profile.date_of_birth else None
                    ),
                    "emergency_contact_name": account.user_profile.emergency_contact_name,
                    "emergency_phone_country_code": account.user_profile.emergency_phone_country_code,
                    "emergency_phone_number": account.user_profile.emergency_phone_number,
                }
        elif account.role.name == "professional":
            if account.professional_profile:
                prof = account.professional_profile
                result["profile"] = {
                    "account_id": str(prof.account_id),
                    "license_number": prof.license_number,
                    "years_experience": prof.years_experience,
                    "rate_cents": prof.rate_cents,
                    "custom_rate_cents": prof.custom_rate_cents,
                    "currency": prof.currency,
                    "short_description": prof.short_description,
                    "academic_experience": prof.academic_experience,
                    "work_experience": prof.work_experience,
                    "certifications": prof.certifications,
                    "languages": prof.languages,
                    "timezone": prof.timezone,
                    "working_hours": prof.working_hours,
                    "emergency_contact_name": prof.emergency_contact_name,
                    "emergency_phone_country_code": prof.emergency_phone_country_code,
                    "emergency_phone_number": prof.emergency_phone_number,
                }

        return result

    def create_user_account(
        self,
        email: str,
        password: str,
        full_name: str,
        phone: Optional[str] = None,
        profile_data: Optional[dict] = None,
    ) -> Account:
        """Create a new user account with user profile."""
        # Check if email already exists
        existing_account = self.get_account_by_email(email)
        if existing_account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Get user role
        user_role = self.db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User role not found in database"
            )

        # Create account
        account = Account(
            role_id=user_role.id,
            email=email,
            full_name=full_name,
            phone=phone,
            hashed_password=get_password_hash(password),
        )
        self.db.add(account)
        self.db.flush()  # Get account.id

        # Create user profile
        user_profile = UserProfile(
            account_id=account.id,
            date_of_birth=profile_data.get("date_of_birth") if profile_data else None,
            emergency_contact_name=profile_data.get("emergency_contact_name") if profile_data else None,
            emergency_phone_country_code=profile_data.get("emergency_phone_country_code") if profile_data else None,
            emergency_phone_number=profile_data.get("emergency_phone_number") if profile_data else None,
        )
        self.db.add(user_profile)
        self.db.commit()
        self.db.refresh(account)

        return account

    def create_professional_account(
        self,
        email: str,
        password: str,
        full_name: str,
        rate_cents: int,
        phone_country_code: Optional[str] = None,
        phone_number: Optional[str] = None,
        profile_data: Optional[dict] = None,
    ) -> Account:
        """Create a new professional account with professional profile."""
        # Check if email already exists
        existing_account = self.get_account_by_email(email)
        if existing_account:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        # Get professional role
        prof_role = self.db.query(Role).filter(Role.name == "professional").first()
        if not prof_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Professional role not found in database"
            )

        # Create account
        account = Account(
            role_id=prof_role.id,
            email=email,
            full_name=full_name,
            phone_country_code=phone_country_code,
            phone_number=phone_number,
            hashed_password=get_password_hash(password),
        )
        self.db.add(account)
        self.db.flush()  # Get account.id

        # Prepare profile data
        if profile_data is None:
            profile_data = {}

        # Create professional profile
        prof_profile = ProfessionalProfile(
            account_id=account.id,
            license_number=profile_data.get("license_number"),
            years_experience=profile_data.get("years_experience", 0),
            rate_cents=rate_cents,
            custom_rate_cents=profile_data.get("custom_rate_cents"),
            currency=profile_data.get("currency", "COP"),
            short_description=profile_data.get("short_description"),
            academic_experience=(
                json.dumps(profile_data.get("academic_experience", []))
                if profile_data.get("academic_experience")
                else None
            ),
            work_experience=(
                json.dumps(profile_data.get("work_experience", [])) if profile_data.get("work_experience") else None
            ),
            certifications=(
                json.dumps(profile_data.get("certifications", [])) if profile_data.get("certifications") else None
            ),
            languages=profile_data.get("languages"),
            timezone=profile_data.get("timezone", "America/Bogota"),
            working_hours=(
                json.dumps(profile_data.get("working_hours", {})) if profile_data.get("working_hours") else None
            ),
            emergency_contact_name=profile_data.get("emergency_contact_name"),
            emergency_phone_country_code=profile_data.get("emergency_phone_country_code"),
            emergency_phone_number=profile_data.get("emergency_phone_number"),
        )
        self.db.add(prof_profile)
        self.db.commit()
        self.db.refresh(account)

        return account

    def update_account(self, account_id: uuid.UUID, account_data: AccountUpdate) -> Optional[Account]:
        """Update account information."""
        account = self.get_account_by_id(account_id)
        if not account:
            return None

        if account_data.full_name is not None:
            account.full_name = account_data.full_name
        if account_data.phone is not None:
            account.phone = account_data.phone
        if account_data.phone_country_code is not None:
            account.phone_country_code = account_data.phone_country_code
        if account_data.phone_number is not None:
            account.phone_number = account_data.phone_number
        if account_data.profile_picture is not None:
            account.profile_picture = account_data.profile_picture
        if account_data.is_verified is not None:
            account.is_verified = account_data.is_verified

        self.db.commit()
        self.db.refresh(account)
        return account

    def deactivate_account(self, account_id: uuid.UUID) -> bool:
        """Deactivate an account."""
        account = self.get_account_by_id(account_id)
        if not account:
            return False

        account.is_active = False
        self.db.commit()
        return True

    def activate_account(self, account_id: uuid.UUID) -> bool:
        """Activate an account."""
        account = self.get_account_by_id(account_id)
        if not account:
            return False

        account.is_active = True
        self.db.commit()
        return True

    def get_accounts_by_role(
        self, role_name: str, skip: int = 0, limit: int = 100, active_only: bool = True
    ) -> List["Account"]:
        """
        Get accounts filtered by role.

        Args:
            role_name: Name of the role ('user', 'professional', 'admin')
            skip: Number of records to skip
            limit: Maximum number of records to return
            active_only: If True, only return active accounts

        Returns:
            List of Account objects
        """
        query = self.db.query(Account).join(Role, Account.role_id == Role.id).filter(Role.name == role_name)

        if active_only:
            query = query.filter(Account.is_active)

        return query.offset(skip).limit(limit).all()

    def get_accounts_admin(
        self, role_name: Optional[str] = None, search: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List["Account"]:
        """
        Get accounts for admin panel with optional search and filtering.

        Args:
            role_name: Optional role name to filter by
            search: Optional search term (searches in full_name and email)
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of Account objects ordered by full_name
        """
        query = self.db.query(Account).options(joinedload(Account.role))

        if role_name:
            query = query.join(Role, Account.role_id == Role.id).filter(Role.name == role_name)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter((Account.full_name.ilike(search_term)) | (Account.email.ilike(search_term)))

        return query.order_by(Account.full_name.asc()).offset(skip).limit(limit).all()

    def count_accounts_by_role(self, role_name: str, search: Optional[str] = None) -> int:
        """
        Count accounts by role with optional search filter.

        Args:
            role_name: Name of the role to filter by
            search: Optional search term

        Returns:
            Count of matching accounts
        """
        query = self.db.query(Account).join(Role, Account.role_id == Role.id).filter(Role.name == role_name)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter((Account.full_name.ilike(search_term)) | (Account.email.ilike(search_term)))

        return query.count()

    def get_professionals_by_specialty(self, specialty_id: str, active_only: bool = True) -> List["Account"]:
        """
        Get professional accounts by specialty.

        Args:
            specialty_id: UUID of the specialty
            active_only: If True, only return active professionals

        Returns:
            List of Account objects with professional role
        """
        from app.models.professional_specialty import ProfessionalSpecialty

        query = (
            self.db.query(Account)
            .join(ProfessionalSpecialty, Account.id == ProfessionalSpecialty.professional_id)
            .join(Role, Account.role_id == Role.id)
            .filter(Role.name == "professional")
            .filter(ProfessionalSpecialty.specialty_id == specialty_id)
            .filter(ProfessionalSpecialty.is_active)
        )

        if active_only:
            query = query.filter(Account.is_active)

        return query.all()
