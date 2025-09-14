"""
Authentication schemas.
"""
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse
from app.schemas.professional import ProfessionalResponse


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


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


class TokenData(BaseModel):
    """Token data schema."""
    user_id: Optional[str] = None


class UserLogin(BaseModel):
    """User login schema."""
    email: str
    password: str


class UnifiedLogin(BaseModel):
    """Unified login schema for both users and professionals."""
    email: str
    password: str


class RefreshToken(BaseModel):
    """Refresh token schema."""
    refresh_token: str
