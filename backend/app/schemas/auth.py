"""
Authentication schemas.
"""

from typing import Optional, Any

from pydantic import BaseModel, EmailStr

from app.schemas.account import AccountWithRole
from app.schemas.professional import ProfessionalResponse
from app.schemas.user import UserResponse


class Token(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data schema."""

    account_id: Optional[str] = None


class UnifiedLogin(BaseModel):
    """Unified login schema for all account types."""

    email: EmailStr
    password: str


class RefreshToken(BaseModel):
    """Refresh token schema."""

    refresh_token: str


# New unified authentication responses using Account system
class UnifiedAuthResponse(Token):
    """Unified authentication response with account and profile data."""

    account: AccountWithRole
    role: str  # "user", "professional", or "admin"
    profile: Optional[Any] = None  # UserProfile or ProfessionalProfile data


class AccountRegisterRequest(BaseModel):
    """Account registration request schema."""

    email: EmailStr
    password: str
    full_name: str
    role: str  # "user" or "professional"
    phone: Optional[str] = None
    phone_country_code: Optional[str] = None
    phone_number: Optional[str] = None
    # Profile-specific fields will be handled separately


# Legacy schemas (to be deprecated) - kept for backward compatibility
class UserTokenResponse(Token):
    """User token response with user data."""

    user: UserResponse


class ProfessionalTokenResponse(Token):
    """Professional token response with professional data."""

    professional: ProfessionalResponse


class UnifiedLoginResponse(Token):
    """Unified login response with user type and data."""

    user_type: str  # "user" or "professional"
    user_data: Optional[UserResponse] = None
    professional_data: Optional[ProfessionalResponse] = None


class UserLogin(BaseModel):
    """User login schema."""

    email: str
    password: str


class UserRegisterResponse(UserTokenResponse):
    """User registration response with tokens and user data."""


class ProfessionalRegisterResponse(ProfessionalTokenResponse):
    """Professional registration response with tokens and professional data."""


class UnifiedRegisterResponse(Token):
    """Unified registration response with user type and data."""

    user_type: str  # "user" or "professional"
    user_data: Optional[UserResponse] = None
    professional_data: Optional[ProfessionalResponse] = None
