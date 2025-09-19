"""
File upload endpoints.
"""

import os
import re
import uuid

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_id
from app.core.database import get_db

router = APIRouter()

# Directory names
UPLOADS_DIR = "uploads"
CERTIFICATIONS_DIR = "certifications"
PROFILE_PICTURES_DIR = "profile_pictures"

# Create uploads directory if it doesn't exist
UPLOAD_DIR = UPLOADS_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Base image types (shared between certifications and profile pictures)
BASE_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
}

# Allowed file types for certifications (PDF + base image types)
ALLOWED_CERTIFICATION_TYPES = {
    "application/pdf",
    *BASE_IMAGE_TYPES,
}

# Allowed file types for profile pictures (base image types + GIF)
ALLOWED_PROFILE_PICTURE_TYPES = {
    *BASE_IMAGE_TYPES,
    "image/gif",
}

# Max file size (5MB for certifications, 2MB for profile pictures)
MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024

# Error messages
FILE_NOT_FOUND_MESSAGE = "File not found"
INVALID_USER_ID_FORMAT_MESSAGE = "Invalid user ID format"
INVALID_FILENAME_MESSAGE = "Invalid filename"
INVALID_FILENAME_FORMAT_MESSAGE = "Invalid filename format"
INVALID_PATH_CONSTRUCTION_MESSAGE = "Invalid path construction"
INVALID_FILE_PATH_CONSTRUCTION_MESSAGE = "Invalid file path construction"
CAN_ONLY_DELETE_OWN_FILES_MESSAGE = "You can only delete your own files"

# File type error messages
CERTIFICATION_FILE_TYPE_ERROR = "File type not allowed. Allowed types: PDF, JPG, PNG"
PROFILE_PICTURE_FILE_TYPE_ERROR = "File type not allowed. Allowed types: JPG, PNG, GIF"

# File size error messages
FILE_TOO_LARGE_MESSAGE = "File too large. Maximum size:"

# Success messages
FILE_DELETED_SUCCESS_MESSAGE = "File deleted successfully"
ERROR_DELETING_FILE_MESSAGE = "Error deleting file:"

# API paths
CERTIFICATION_API_PATH = "/api/v1/files/certification/"
PROFILE_PICTURE_API_PATH = "/api/v1/files/profile-picture/"


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
    if not re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_USER_ID_FORMAT_MESSAGE
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
    if not filename or ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_FILENAME_MESSAGE
        )

    # Validate filename format - should be UUID + extension
    if not re.match(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-zA-Z0-9]+$", filename
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_FILENAME_FORMAT_MESSAGE
        )

    return validated_user_id, filename


def safe_create_user_directory(base_dir: str, sub_dir: str, user_id: str) -> str:
    """
    Safely create a user-specific directory after validating the user_id.

    Args:
        base_dir: Base directory (e.g., "uploads")
        sub_dir: Subdirectory (e.g., CERTIFICATIONS_DIR, PROFILE_PICTURES_DIR)
        user_id: User ID to validate and use in path

    Returns:
        Path to the created directory

    Raises:
        HTTPException: If user_id validation fails
    """
    # Validate user_id before using it in path construction
    validated_user_id = validate_user_id(user_id)

    # Construct the path safely using only validated components
    # Use os.path.normpath to prevent path traversal
    user_upload_dir = os.path.normpath(os.path.join(base_dir, sub_dir, validated_user_id))

    # Additional security check: ensure the path is within the expected directory
    expected_base = os.path.normpath(base_dir)
    if not user_upload_dir.startswith(expected_base):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_PATH_CONSTRUCTION_MESSAGE
        )

    # Create directory
    os.makedirs(user_upload_dir, exist_ok=True)

    return user_upload_dir


def safe_construct_file_path(base_dir: str, sub_dir: str, user_id: str, filename: str) -> str:
    """
    Safely construct a file path without using user-controlled data directly.

    Args:
        base_dir: Base directory (e.g., "uploads")
        sub_dir: Subdirectory (e.g., CERTIFICATIONS_DIR, PROFILE_PICTURES_DIR)
        user_id: User ID (already validated)
        filename: Filename (already validated)

    Returns:
        Safe file path

    Raises:
        HTTPException: If path construction fails security checks
    """
    # Get the safe user directory
    user_upload_dir = safe_create_user_directory(base_dir, sub_dir, user_id)

    # Construct the file path using only validated components
    file_path = os.path.normpath(os.path.join(user_upload_dir, filename))

    # Additional security check: ensure the file path is within the user directory
    if not file_path.startswith(user_upload_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_FILE_PATH_CONSTRUCTION_MESSAGE
        )

    return file_path


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
            detail=CERTIFICATION_FILE_TYPE_ERROR,
        )

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{FILE_TOO_LARGE_MESSAGE} {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create user-specific directory safely and construct file path
    file_path = safe_construct_file_path(
        UPLOAD_DIR, CERTIFICATIONS_DIR, current_user_id, unique_filename
    )

    # Save file
    async with aiofiles.open(file_path, "wb") as buffer:
        await buffer.write(file_content)

    # Return file URL
    file_url = f"{CERTIFICATION_API_PATH}{current_user_id}/{unique_filename}"

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
            detail=PROFILE_PICTURE_FILE_TYPE_ERROR,
        )

    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_PROFILE_PICTURE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{FILE_TOO_LARGE_MESSAGE} {MAX_PROFILE_PICTURE_SIZE // (1024*1024)}MB",
        )

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Create user-specific directory safely and construct file path
    file_path = safe_construct_file_path(
        UPLOAD_DIR, PROFILE_PICTURES_DIR, current_user_id, unique_filename
    )

    # Save file
    async with aiofiles.open(file_path, "wb") as buffer:
        await buffer.write(file_content)

    # Return file URL
    file_url = f"{PROFILE_PICTURE_API_PATH}{current_user_id}/{unique_filename}"

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

    file_path = safe_construct_file_path(
        UPLOAD_DIR, PROFILE_PICTURES_DIR, validated_user_id, validated_filename
    )

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=FILE_NOT_FOUND_MESSAGE)

    return FileResponse(path=file_path, filename=validated_filename, media_type="image/jpeg")


@router.get("/certification/{user_id}/{filename}")
async def get_certification_document(user_id: str, filename: str, db: Session = Depends(get_db)):
    """Get a certification document."""

    # Validate path components to prevent path traversal
    validated_user_id, validated_filename = validate_path_components(user_id, filename)

    file_path = safe_construct_file_path(
        UPLOAD_DIR, CERTIFICATIONS_DIR, validated_user_id, validated_filename
    )

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=FILE_NOT_FOUND_MESSAGE)

    return FileResponse(
        path=file_path, filename=validated_filename, media_type="application/octet-stream"
    )


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
            detail=CAN_ONLY_DELETE_OWN_FILES_MESSAGE,
        )

    file_path = safe_construct_file_path(
        UPLOAD_DIR, PROFILE_PICTURES_DIR, validated_user_id, validated_filename
    )

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=FILE_NOT_FOUND_MESSAGE)

    try:
        os.remove(file_path)
        return {"message": FILE_DELETED_SUCCESS_MESSAGE}
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
            detail=CAN_ONLY_DELETE_OWN_FILES_MESSAGE,
        )

    file_path = safe_construct_file_path(
        UPLOAD_DIR, CERTIFICATIONS_DIR, validated_user_id, validated_filename
    )

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=FILE_NOT_FOUND_MESSAGE)

    try:
        os.remove(file_path)
        return {"message": FILE_DELETED_SUCCESS_MESSAGE}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}",
        )
