"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_token_response, verify_token
from app.utils.auth import get_current_user_id
from app.schemas.auth import (
    ProfessionalRegisterResponse,
    ProfessionalTokenResponse,
    RefreshToken,
    Token,
    UnifiedLogin,
    UnifiedLoginResponse,
    UnifiedRegisterResponse,
    UserLogin,
    UserRegisterResponse,
    UserTokenResponse,
)
from app.schemas.professional import (
    ProfessionalCreate,
    ProfessionalLogin,
)
from app.schemas.user import UserCreate
from app.models.user import UserRole
from app.services.auth_service import AuthService
from app.utils.parsers import parse_professional_data, parse_user_data

router = APIRouter()

# Error messages
INCORRECT_CREDENTIALS_MESSAGE = "Incorrect email or password"
USER_NOT_FOUND_MESSAGE = "User not found"
INVALID_REFRESH_TOKEN_MESSAGE = "Invalid refresh token"


@router.post("/register/user", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return authentication tokens."""
    auth_service = AuthService(db)
    user = auth_service.create_user(user_data)

    # Create authentication tokens
    token_response = create_token_response(str(user.id))

    # Parse user data for response
    user_data_response = parse_user_data(user)

    return UserRegisterResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        user=user_data_response,
    )


@router.post(
    "/register/professional",
    response_model=ProfessionalRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_professional(professional_data: ProfessionalCreate, db: Session = Depends(get_db)):
    """Register a new professional and return authentication tokens."""
    auth_service = AuthService(db)
    professional = auth_service.create_professional(professional_data)

    # Create authentication tokens
    token_response = create_token_response(str(professional.id))

    # Parse professional data for response
    professional_data_response = parse_professional_data(professional)

    return ProfessionalRegisterResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        professional=professional_data_response,
    )


@router.post("/register", response_model=UnifiedRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_unified(register_data: UnifiedLogin, db: Session = Depends(get_db)):
    """Unified registration for both users and professionals."""
    auth_service = AuthService(db)

    # For now, we'll default to creating a regular user
    # In the future, this could be enhanced to determine user type based on additional fields
    user_data = UserCreate(
        email=register_data.email,
        password=register_data.password,
        full_name="",  # This would need to be provided in the request
        role=UserRole.USER,
    )

    user = auth_service.create_user(user_data)

    # Create authentication tokens
    token_response = create_token_response(str(user.id))

    # Parse user data for response
    user_data_response = parse_user_data(user)

    return UnifiedRegisterResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        user_type="user",
        user_data=user_data_response,
    )


@router.post("/login/user", response_model=UserTokenResponse)
async def login_user(user_login: UserLogin, db: Session = Depends(get_db)):
    """Login user."""
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(user_login.email, user_login.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INCORRECT_CREDENTIALS_MESSAGE,
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    token_response = create_token_response(str(user.id))
    return UserTokenResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        user=user,
    )


@router.post("/login/professional", response_model=ProfessionalTokenResponse)
async def login_professional(professional_login: ProfessionalLogin, db: Session = Depends(get_db)):
    """Login professional."""
    auth_service = AuthService(db)
    professional = auth_service.authenticate_professional(professional_login.email, professional_login.password)

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INCORRECT_CREDENTIALS_MESSAGE,
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not professional.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive professional")

    token_response = create_token_response(str(professional.id))
    return ProfessionalTokenResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        professional=parse_professional_data(professional),
    )


@router.post("/login", response_model=UnifiedLoginResponse)
async def login_unified(login_data: UnifiedLogin, db: Session = Depends(get_db)):
    """Unified login for both users and professionals."""
    auth_service = AuthService(db)

    # Try to authenticate as professional first
    professional = auth_service.authenticate_professional(login_data.email, login_data.password)
    if professional and professional.is_active:
        token_response = create_token_response(str(professional.id))

        # Convert professional to response format
        professional_data = parse_professional_data(professional)

        return UnifiedLoginResponse(
            access_token=token_response["access_token"],
            refresh_token=token_response["refresh_token"],
            token_type=token_response["token_type"],
            user_type="professional",
            professional_data=professional_data,
        )

    # Try to authenticate as regular user
    user = auth_service.authenticate_user(login_data.email, login_data.password)
    if user and user.is_active:
        token_response = create_token_response(str(user.id))

        # Convert user to response format
        user_data = parse_user_data(user)

        return UnifiedLoginResponse(
            access_token=token_response["access_token"],
            refresh_token=token_response["refresh_token"],
            token_type=token_response["token_type"],
            user_type="user",
            user_data=user_data,
        )

    # If neither worked, return authentication error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=INCORRECT_CREDENTIALS_MESSAGE,
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshToken, _db: Session = Depends(get_db)):
    """Refresh access token."""
    user_id = verify_token(refresh_data.refresh_token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_REFRESH_TOKEN_MESSAGE,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_token_response(user_id)


@router.get("/me")
async def get_current_user_info(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get current user information (sanitized)."""
    auth_service = AuthService(db)

    # Try to get as user first
    user = auth_service.get_user_by_id(current_user_id)
    if user:
        # Return sanitized user data
        user_data = parse_user_data(user)
        return {"type": user.role.value, "data": user_data}

    # Try to get as professional
    professional = auth_service.get_professional_by_id(current_user_id)
    if professional:
        # Return sanitized professional data
        professional_data = parse_professional_data(professional)
        return {"type": "professional", "data": professional_data}

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_MESSAGE)
