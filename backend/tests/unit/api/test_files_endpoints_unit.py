"""
Unit tests for files endpoints.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.api.v1.endpoints.files import (
    delete_certification_document,
    delete_profile_picture,
    get_certification_document,
    get_profile_picture,
    safe_construct_file_path,
    safe_create_user_directory,
    upload_certification_document,
    upload_profile_picture,
    validate_path_components,
    validate_user_id,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def sample_user_id():
    """Sample user ID for testing."""
    return str(uuid.uuid4())


@pytest.fixture
def sample_filename():
    """Sample filename for testing."""
    return f"{uuid.uuid4()}.pdf"


@pytest.fixture
def mock_upload_file():
    """Mock UploadFile for testing."""
    mock_file = MagicMock(spec=UploadFile)
    mock_file.filename = "test.pdf"
    mock_file.content_type = "application/pdf"
    mock_file.read = AsyncMock(return_value=b"test content")
    return mock_file


@pytest.fixture
def mock_db_session():
    """Mock database session."""
    return MagicMock()


@pytest.fixture
def mock_file_response():
    """Mock FileResponse for testing."""
    return MagicMock(spec=FileResponse)


class TestValidateUserId:
    """Test validate_user_id function."""

    @pytest.mark.asyncio
    async def test_validate_user_id_valid(self, sample_user_id):
        """Test validation with valid UUID."""
        result = validate_user_id(sample_user_id)
        assert result == sample_user_id

    @pytest.mark.asyncio
    async def test_validate_user_id_invalid_format(self):
        """Test validation with invalid UUID format."""
        with pytest.raises(HTTPException) as exc_info:
            validate_user_id("invalid-uuid")

        assert exc_info.value.status_code == 400
        assert "Invalid user ID format" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_validate_user_id_empty_string(self):
        """Test validation with empty string."""
        with pytest.raises(HTTPException) as exc_info:
            validate_user_id("")

        assert exc_info.value.status_code == 400
        assert "Invalid user ID format" in str(exc_info.value.detail)


class TestValidatePathComponents:
    """Test validate_path_components function."""

    @pytest.mark.asyncio
    async def test_validate_path_components_valid(self, sample_user_id, sample_filename):
        """Test validation with valid components."""
        result_user_id, result_filename = validate_path_components(sample_user_id, sample_filename)
        assert result_user_id == sample_user_id
        assert result_filename == sample_filename

    @pytest.mark.asyncio
    async def test_validate_path_components_invalid_user_id(self, sample_filename):
        """Test validation with invalid user ID."""
        with pytest.raises(HTTPException) as exc_info:
            validate_path_components("invalid-uuid", sample_filename)

        assert exc_info.value.status_code == 400
        assert "Invalid user ID format" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_validate_path_components_path_traversal_in_filename(self, sample_user_id):
        """Test validation with path traversal in filename."""
        with pytest.raises(HTTPException) as exc_info:
            validate_path_components(sample_user_id, "../../../etc/passwd")

        assert exc_info.value.status_code == 400
        assert "Invalid filename" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_validate_path_components_invalid_filename_format(self, sample_user_id):
        """Test validation with invalid filename format."""
        with pytest.raises(HTTPException) as exc_info:
            validate_path_components(sample_user_id, "invalid-filename")

        assert exc_info.value.status_code == 400
        assert "Invalid filename format" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_validate_path_components_empty_filename(self, sample_user_id):
        """Test validation with empty filename."""
        with pytest.raises(HTTPException) as exc_info:
            validate_path_components(sample_user_id, "")

        assert exc_info.value.status_code == 400
        assert "Invalid filename" in str(exc_info.value.detail)


class TestSafeCreateUserDirectory:
    """Test safe_create_user_directory function."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.os.makedirs")
    async def test_safe_create_user_directory_success(self, mock_makedirs, sample_user_id):
        """Test successful directory creation."""
        result = safe_create_user_directory("uploads", "certifications", sample_user_id)

        assert sample_user_id in result
        mock_makedirs.assert_called_once()

    @pytest.mark.asyncio
    async def test_safe_create_user_directory_invalid_user_id(self):
        """Test directory creation with invalid user ID."""
        with pytest.raises(HTTPException) as exc_info:
            safe_create_user_directory("uploads", "certifications", "invalid-uuid")

        assert exc_info.value.status_code == 400
        assert "Invalid user ID format" in str(exc_info.value.detail)


class TestSafeConstructFilePath:
    """Test safe_construct_file_path function."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_create_user_directory")
    async def test_safe_construct_file_path_success(self, mock_create_dir, sample_user_id, sample_filename):
        """Test successful file path construction."""
        mock_create_dir.return_value = "/uploads/certifications/test-user-id"

        result = safe_construct_file_path("uploads", "certifications", sample_user_id, sample_filename)

        assert sample_filename in result
        mock_create_dir.assert_called_once()

    @pytest.mark.asyncio
    async def test_safe_construct_file_path_invalid_user_id(self, sample_filename):
        """Test file path construction with invalid user ID."""
        with pytest.raises(HTTPException) as exc_info:
            safe_construct_file_path("uploads", "certifications", "invalid-uuid", sample_filename)

        assert exc_info.value.status_code == 400
        assert "Invalid user ID format" in str(exc_info.value.detail)


class TestUploadCertificationDocument:
    """Test upload_certification_document endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.aiofiles.open")
    async def test_upload_certification_document_success(
        self, mock_aiofiles_open, mock_construct_path, sample_user_id, mock_upload_file, mock_db_session
    ):
        """Test successful certification upload."""
        mock_construct_path.return_value = "/uploads/certifications/test-user-id/test-file.pdf"
        mock_file = AsyncMock()
        mock_aiofiles_open.return_value.__aenter__.return_value = mock_file

        result = await upload_certification_document(mock_upload_file, sample_user_id, mock_db_session)

        assert "filename" in result
        assert "file_url" in result
        assert "file_size" in result
        assert "content_type" in result
        assert result["content_type"] == "application/pdf"
        mock_file.write.assert_called_once_with(b"test content")

    @pytest.mark.asyncio
    async def test_upload_certification_document_invalid_file_type(self, sample_user_id, mock_db_session):
        """Test upload with invalid file type."""
        mock_file = MagicMock(spec=UploadFile)
        mock_file.content_type = "text/plain"
        mock_file.filename = "test.txt"

        with pytest.raises(HTTPException) as exc_info:
            await upload_certification_document(mock_file, sample_user_id, mock_db_session)

        assert exc_info.value.status_code == 400
        assert "File type not allowed" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_upload_certification_document_file_too_large(self, sample_user_id, mock_db_session):
        """Test upload with file too large."""
        mock_file = MagicMock(spec=UploadFile)
        mock_file.content_type = "application/pdf"
        mock_file.filename = "test.pdf"
        mock_file.read = AsyncMock(return_value=b"x" * (6 * 1024 * 1024))  # 6MB

        with pytest.raises(HTTPException) as exc_info:
            await upload_certification_document(mock_file, sample_user_id, mock_db_session)

        assert exc_info.value.status_code == 400
        assert "File too large" in str(exc_info.value.detail)


class TestUploadProfilePicture:
    """Test upload_profile_picture endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.aiofiles.open")
    async def test_upload_profile_picture_success(
        self, mock_aiofiles_open, mock_construct_path, sample_user_id, mock_db_session
    ):
        """Test successful profile picture upload."""
        mock_construct_path.return_value = "/uploads/profile_pictures/test-user-id/test-file.jpg"
        mock_file = AsyncMock()
        mock_aiofiles_open.return_value.__aenter__.return_value = mock_file

        mock_upload_file = MagicMock(spec=UploadFile)
        mock_upload_file.filename = "test.jpg"
        mock_upload_file.content_type = "image/jpeg"
        mock_upload_file.read = AsyncMock(return_value=b"image content")

        result = await upload_profile_picture(mock_upload_file, sample_user_id, mock_db_session)

        assert "filename" in result
        assert "file_url" in result
        assert "file_size" in result
        assert "content_type" in result
        assert result["content_type"] == "image/jpeg"
        mock_file.write.assert_called_once_with(b"image content")

    @pytest.mark.asyncio
    async def test_upload_profile_picture_invalid_file_type(self, sample_user_id, mock_db_session):
        """Test upload with invalid file type."""
        mock_file = MagicMock(spec=UploadFile)
        mock_file.content_type = "application/pdf"
        mock_file.filename = "test.pdf"

        with pytest.raises(HTTPException) as exc_info:
            await upload_profile_picture(mock_file, sample_user_id, mock_db_session)

        assert exc_info.value.status_code == 400
        assert "File type not allowed" in str(exc_info.value.detail)


class TestGetProfilePicture:
    """Test get_profile_picture endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    @patch("app.api.v1.endpoints.files.FileResponse")
    async def test_get_profile_picture_success(
        self, mock_file_response, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test successful profile picture retrieval."""
        mock_construct_path.return_value = "/uploads/profile_pictures/test-user-id/test-file.jpg"
        mock_exists.return_value = True
        mock_file_response.return_value = MagicMock()

        result = await get_profile_picture(sample_user_id, sample_filename, mock_db_session)

        assert result is not None
        mock_file_response.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    async def test_get_profile_picture_not_found(
        self, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test profile picture not found."""
        mock_construct_path.return_value = "/uploads/profile_pictures/test-user-id/test-file.jpg"
        mock_exists.return_value = False

        with pytest.raises(HTTPException) as exc_info:
            await get_profile_picture(sample_user_id, sample_filename, mock_db_session)

        assert exc_info.value.status_code == 404
        assert "File not found" in str(exc_info.value.detail)


class TestGetCertificationDocument:
    """Test get_certification_document endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    @patch("app.api.v1.endpoints.files.FileResponse")
    async def test_get_certification_document_success(
        self, mock_file_response, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test successful certification document retrieval."""
        mock_construct_path.return_value = "/uploads/certifications/test-user-id/test-file.pdf"
        mock_exists.return_value = True
        mock_file_response.return_value = MagicMock()

        result = await get_certification_document(sample_user_id, sample_filename, mock_db_session)

        assert result is not None
        mock_file_response.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    async def test_get_certification_document_not_found(
        self, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test certification document not found."""
        mock_construct_path.return_value = "/uploads/certifications/test-user-id/test-file.pdf"
        mock_exists.return_value = False

        with pytest.raises(HTTPException) as exc_info:
            await get_certification_document(sample_user_id, sample_filename, mock_db_session)

        assert exc_info.value.status_code == 404
        assert "File not found" in str(exc_info.value.detail)


class TestDeleteProfilePicture:
    """Test delete_profile_picture endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    @patch("app.api.v1.endpoints.files.os.remove")
    async def test_delete_profile_picture_success(
        self, mock_remove, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test successful profile picture deletion."""
        mock_construct_path.return_value = "/uploads/profile_pictures/test-user-id/test-file.jpg"
        mock_exists.return_value = True

        result = await delete_profile_picture(sample_user_id, sample_filename, sample_user_id, mock_db_session)

        assert "message" in result
        assert "File deleted successfully" in result["message"]
        mock_remove.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    async def test_delete_profile_picture_different_user(
        self, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test deletion by different user."""
        different_user_id = str(uuid.uuid4())
        mock_construct_path.return_value = "/uploads/profile_pictures/test-user-id/test-file.jpg"

        with pytest.raises(HTTPException) as exc_info:
            await delete_profile_picture(sample_user_id, sample_filename, different_user_id, mock_db_session)

        assert exc_info.value.status_code == 403
        assert "You can only delete your own files" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    async def test_delete_profile_picture_not_found(
        self, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test deletion of non-existent file."""
        mock_construct_path.return_value = "/uploads/profile_pictures/test-user-id/test-file.jpg"
        mock_exists.return_value = False

        with pytest.raises(HTTPException) as exc_info:
            await delete_profile_picture(sample_user_id, sample_filename, sample_user_id, mock_db_session)

        assert exc_info.value.status_code == 404
        assert "File not found" in str(exc_info.value.detail)


class TestDeleteCertificationDocument:
    """Test delete_certification_document endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    @patch("app.api.v1.endpoints.files.os.remove")
    async def test_delete_certification_document_success(
        self, mock_remove, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test successful certification document deletion."""
        mock_construct_path.return_value = "/uploads/certifications/test-user-id/test-file.pdf"
        mock_exists.return_value = True

        result = await delete_certification_document(sample_user_id, sample_filename, sample_user_id, mock_db_session)

        assert "message" in result
        assert "File deleted successfully" in result["message"]
        mock_remove.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.files.safe_construct_file_path")
    @patch("app.api.v1.endpoints.files.os.path.exists")
    @patch("app.api.v1.endpoints.files.os.remove")
    async def test_delete_certification_document_os_error(
        self, mock_remove, mock_exists, mock_construct_path, sample_user_id, sample_filename, mock_db_session
    ):
        """Test deletion with OS error."""
        mock_construct_path.return_value = "/uploads/certifications/test-user-id/test-file.pdf"
        mock_exists.return_value = True
        mock_remove.side_effect = OSError("Permission denied")

        with pytest.raises(HTTPException) as exc_info:
            await delete_certification_document(sample_user_id, sample_filename, sample_user_id, mock_db_session)

        assert exc_info.value.status_code == 500
        assert "Error deleting file" in str(exc_info.value.detail)
