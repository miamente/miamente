"""
User schemas.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
import uuid


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    """User update schema."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    profile_picture: Optional[str] = None
    is_verified: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema."""
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    profile_picture: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str
