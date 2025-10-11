"""
Pydantic schemas for request/response validation.
"""

# New unified account system schemas
from app.schemas.role import RoleCreate, RoleResponse, RoleUpdate
from app.schemas.account import (
    AccountCreate,
    AccountResponse,
    AccountUpdate,
    AccountWithRole,
)
from app.schemas.user_profile import (
    UserProfileCreate,
    UserProfileResponse,
    UserProfileUpdate,
)
from app.schemas.professional_profile import (
    ProfessionalProfileCreate,
    ProfessionalProfileResponse,
    ProfessionalProfileUpdate,
)

# Authentication schemas
from app.schemas.auth import (
    Token,
    TokenData,
    UnifiedLogin,
    UnifiedAuthResponse,
    AccountRegisterRequest,
    RefreshToken,
)

# Legacy schemas (to be deprecated)
from app.schemas.professional import (
    ProfessionalCreate,
    ProfessionalResponse,
    ProfessionalUpdate,
)
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate

__all__ = [
    # New unified system
    "RoleCreate",
    "RoleUpdate",
    "RoleResponse",
    "AccountCreate",
    "AccountUpdate",
    "AccountResponse",
    "AccountWithRole",
    "UserProfileCreate",
    "UserProfileUpdate",
    "UserProfileResponse",
    "ProfessionalProfileCreate",
    "ProfessionalProfileUpdate",
    "ProfessionalProfileResponse",
    # Authentication
    "Token",
    "TokenData",
    "UnifiedLogin",
    "UnifiedAuthResponse",
    "AccountRegisterRequest",
    "RefreshToken",
    # Legacy (to be deprecated)
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLogin",
    "ProfessionalCreate",
    "ProfessionalUpdate",
    "ProfessionalResponse",
]
