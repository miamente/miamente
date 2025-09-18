"""
File upload endpoints.
"""

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id

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

    # Create user-specific directory
    user_upload_dir = os.path.join(UPLOAD_DIR, "certifications", current_user_id)
    os.makedirs(user_upload_dir, exist_ok=True)

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

    # Create user-specific directory
    user_upload_dir = os.path.join(UPLOAD_DIR, "profile_pictures", current_user_id)
    os.makedirs(user_upload_dir, exist_ok=True)

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

    file_path = os.path.join(UPLOAD_DIR, "profile_pictures", user_id, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FileResponse(path=file_path, filename=filename, media_type="image/jpeg")


@router.get("/certification/{user_id}/{filename}")
async def get_certification_document(user_id: str, filename: str, db: Session = Depends(get_db)):
    """Get a certification document."""

    file_path = os.path.join(UPLOAD_DIR, "certifications", user_id, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FileResponse(path=file_path, filename=filename, media_type="application/octet-stream")


@router.delete("/profile-picture/{user_id}/{filename}")
async def delete_profile_picture(
    user_id: str,
    filename: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a profile picture."""

    # Only allow users to delete their own files
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own files",
        )

    file_path = os.path.join(UPLOAD_DIR, "profile_pictures", user_id, filename)

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

    # Only allow users to delete their own files
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own files",
        )

    file_path = os.path.join(UPLOAD_DIR, "certifications", user_id, filename)

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
