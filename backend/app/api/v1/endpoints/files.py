"""
File upload endpoints.
"""

import os
import re
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_id
from app.core.database import get_db

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file types for certifications
ALLOWED_CERTIFICATION_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}

# Allowed file types for profile pictures
ALLOWED_PROFILE_PICTURE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif"}

# Max file size (5MB for certifications, 2MB for profile pictures)
MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024


def validate_user_id(user_id: str) -> str:
    """
    Validate user_id to prevent path traversal attacks.
    
    Args:
        user_id: User ID to validate
        
    Returns:
        Validated user_id
        
    Raises:
        HTTPException: If validation fails
    """
    # Validate user_id - should be UUID format
    if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    return user_id


def validate_path_components(user_id: str, filename: str) -> tuple[str, str]:
    """
    Validate user_id and filename to prevent path traversal attacks.
    
    Args:
        user_id: User ID from URL parameter
        filename: Filename from URL parameter
        
    Returns:
        Tuple of validated (user_id, filename)
        
    Raises:
        HTTPException: If validation fails
    """
    # Validate user_id - should be UUID format
    validated_user_id = validate_user_id(user_id)
    
    # Validate filename - should not contain path traversal characters
    if not filename or '..' in filename or '/' in filename or '\\' in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    # Validate filename format - should be UUID + extension
    if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-zA-Z0-9]+$', filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename format"
        )
    
    return validated_user_id, filename


def safe_create_user_directory(base_dir: str, sub_dir: str, user_id: str) -> str:
    """
    Safely create a user-specific directory after validating the user_id.
    
    Args:
        base_dir: Base directory (e.g., "uploads")
        sub_dir: Subdirectory (e.g., "certifications", "profile_pictures")
        user_id: User ID to validate and use in path
        
    Returns:
        Path to the created directory
        
    Raises:
        HTTPException: If user_id validation fails
    """
    # Validate user_id before using it in path construction
    validated_user_id = validate_user_id(user_id)
    
    # Construct the path safely
    user_upload_dir = os.path.join(base_dir, sub_dir, validated_user_id)
    
    # Create directory
    os.makedirs(user_upload_dir, exist_ok=True)
    
    return user_upload_dir


@router.post("/upload/certification")
async def upload_certification_document(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upload a certification document."""

    # Validate file type
    if file.content_type not in ALLOWED_CERTIFICATION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Allowed types: PDF, JPG, PNG",
        )

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create user-specific directory safely
    user_upload_dir = safe_create_user_directory(UPLOAD_DIR, "certifications", current_user_id)

    # Save file
    file_path = os.path.join(user_upload_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    # Return file URL
    file_url = f"/api/v1/files/certification/{current_user_id}/{unique_filename}"

    return {
        "filename": file.filename,
        "file_url": file_url,
        "file_size": len(file_content),
        "content_type": file.content_type,
    }


@router.post("/upload/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upload a profile picture."""

    # Validate file type
    if file.content_type not in ALLOWED_PROFILE_PICTURE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Allowed types: JPG, PNG, GIF",
        )

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_PROFILE_PICTURE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(f"File too large. Maximum size: {MAX_PROFILE_PICTURE_SIZE // (1024*1024)}MB",),
        )

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create user-specific directory safely
    user_upload_dir = safe_create_user_directory(UPLOAD_DIR, "profile_pictures", current_user_id)

    # Save file
    file_path = os.path.join(user_upload_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    # Return file URL
    file_url = f"/api/v1/files/profile-picture/{current_user_id}/{unique_filename}"

    return {
        "filename": file.filename,
        "file_url": file_url,
        "file_size": len(file_content),
        "content_type": file.content_type,
    }


@router.get("/profile-picture/{user_id}/{filename}")
async def get_profile_picture(user_id: str, filename: str, db: Session = Depends(get_db)):
    """Get a profile picture."""

    # Validate path components to prevent path traversal
    validated_user_id, validated_filename = validate_path_components(user_id, filename)

    file_path = os.path.join(UPLOAD_DIR, "profile_pictures", validated_user_id, validated_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FileResponse(path=file_path, filename=validated_filename, media_type="image/jpeg")


@router.get("/certification/{user_id}/{filename}")
async def get_certification_document(user_id: str, filename: str, db: Session = Depends(get_db)):
    """Get a certification document."""

    # Validate path components to prevent path traversal
    validated_user_id, validated_filename = validate_path_components(user_id, filename)

    file_path = os.path.join(UPLOAD_DIR, "certifications", validated_user_id, validated_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FileResponse(path=file_path, filename=validated_filename, media_type="application/octet-stream")


@router.delete("/profile-picture/{user_id}/{filename}")
async def delete_profile_picture(
    user_id: str,
    filename: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a profile picture."""

    # Validate path components to prevent path traversal
    validated_user_id, validated_filename = validate_path_components(user_id, filename)

    # Only allow users to delete their own files
    if validated_user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own files",
        )

    file_path = os.path.join(UPLOAD_DIR, "profile_pictures", validated_user_id, validated_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}",
        )


@router.delete("/certification/{user_id}/{filename}")
async def delete_certification_document(
    user_id: str,
    filename: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a certification document."""

    # Validate path components to prevent path traversal
    validated_user_id, validated_filename = validate_path_components(user_id, filename)

    # Only allow users to delete their own files
    if validated_user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own files",
        )

    file_path = os.path.join(UPLOAD_DIR, "certifications", validated_user_id, validated_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}",
        )
