"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import verify_token
from app.services.auth_service import AuthService
from app.schemas.auth import Token, UserLogin, RefreshToken, UserTokenResponse, ProfessionalTokenResponse, UnifiedLogin, UnifiedLoginResponse
from app.schemas.user import UserCreate, UserResponse
from app.schemas.professional import ProfessionalCreate, ProfessionalResponse, ProfessionalLogin

router = APIRouter()
security = HTTPBearer(auto_error=False)


def get_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    """Get current user ID from token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id


@router.post("/register/user", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    auth_service = AuthService(db)
    user = auth_service.create_user(user_data)
    return user


@router.post("/register/professional", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED)
async def register_professional(professional_data: ProfessionalCreate, db: Session = Depends(get_db)):
    """Register a new professional."""
    auth_service = AuthService(db)
    professional = auth_service.create_professional(professional_data)
    return professional


@router.post("/login/user", response_model=UserTokenResponse)
async def login_user(user_login: UserLogin, db: Session = Depends(get_db)):
    """Login user."""
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(user_login.email, user_login.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    from app.core.security import create_token_response
    token_response = create_token_response(str(user.id))
    return UserTokenResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        user=user
    )


@router.post("/login/professional", response_model=ProfessionalTokenResponse)
async def login_professional(professional_login: ProfessionalLogin, db: Session = Depends(get_db)):
    """Login professional."""
    auth_service = AuthService(db)
    professional = auth_service.authenticate_professional(
        professional_login.email, 
        professional_login.password
    )
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not professional.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive professional"
        )
    
    from app.core.security import create_token_response
    
    token_response = create_token_response(str(professional.id))
    return ProfessionalTokenResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        professional=professional
    )


@router.post("/login", response_model=UnifiedLoginResponse)
async def login_unified(login_data: UnifiedLogin, db: Session = Depends(get_db)):
    """Unified login for both users and professionals."""
    auth_service = AuthService(db)
    
    # Try to authenticate as professional first
    professional = auth_service.authenticate_professional(login_data.email, login_data.password)
    if professional and professional.is_active:
        from app.core.security import create_token_response
        token_response = create_token_response(str(professional.id))
        
        # Convert professional to response format
        from app.api.v1.endpoints.professionals import parse_professional_data
        professional_data = parse_professional_data(professional)
        
        return UnifiedLoginResponse(
            access_token=token_response["access_token"],
            refresh_token=token_response["refresh_token"],
            token_type=token_response["token_type"],
            user_type="professional",
            professional_data=professional_data
        )
    
    # Try to authenticate as regular user
    user = auth_service.authenticate_user(login_data.email, login_data.password)
    if user and user.is_active:
        from app.core.security import create_token_response
        token_response = create_token_response(str(user.id))
        
        # Convert user to response format
        from app.api.v1.endpoints.users import parse_user_data
        user_data = parse_user_data(user)
        
        return UnifiedLoginResponse(
            access_token=token_response["access_token"],
            refresh_token=token_response["refresh_token"],
            token_type=token_response["token_type"],
            user_type="user",
            user_data=user_data
        )
    
    # If neither worked, return authentication error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/simulate-verification")
async def simulate_email_verification(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Simulate email verification for development purposes."""
    auth_service = AuthService(db)
    
    # Try to update user first
    user = auth_service.get_user_by_id(user_id)
    if user:
        user.is_verified = True
        db.commit()
        return {"message": "User email verification simulated", "user_type": "user"}
    
    # Try to update professional
    professional = auth_service.get_professional_by_id(user_id)
    if professional:
        professional.is_verified = True
        db.commit()
        return {"message": "Professional email verification simulated", "user_type": "professional"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshToken, db: Session = Depends(get_db)):
    """Refresh access token."""
    user_id = verify_token(refresh_data.refresh_token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    from app.core.security import create_token_response
    return create_token_response(user_id)


@router.get("/me")
async def get_current_user_info(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current user information."""
    auth_service = AuthService(db)
    
    # Try to get as user first
    user = auth_service.get_user_by_id(current_user_id)
    if user:
        return {"type": "user", "data": user}
    
    # Try to get as professional
    professional = auth_service.get_professional_by_id(current_user_id)
    if professional:
        return {"type": "professional", "data": professional}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )
