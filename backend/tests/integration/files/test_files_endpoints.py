"""
Integration tests for file upload endpoints.
"""

import io
import uuid
from fastapi.testclient import TestClient


class TestFileUploadEndpoints:
    """Test file upload and management endpoints."""

    def test_upload_certification_document_success(self, client: TestClient, test_data_factory):
        """Test successful certification document upload."""
        # Create a test user first
        user_data = test_data_factory["user"]("cert_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a test PDF file
        test_content = b"Test PDF content"
        test_file = io.BytesIO(test_content)

        # Upload certification
        response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("test_cert.pdf", test_file, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "test_cert.pdf"
        assert data["file_size"] == len(test_content)
        assert data["content_type"] == "application/pdf"
        assert "file_url" in data
        assert data["file_url"].startswith("/api/v1/files/certification/")

    def test_upload_certification_document_invalid_type(self, client: TestClient, test_data_factory):
        """Test certification upload with invalid file type."""
        # Create a test user first
        user_data = test_data_factory["user"]("cert_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a test file with invalid type
        test_content = b"Test content"
        test_file = io.BytesIO(test_content)

        # Upload certification with invalid type
        response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("test_cert.txt", test_file, "text/plain")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
        assert "File type not allowed" in response.json()["detail"]

    def test_upload_certification_document_too_large(self, client: TestClient, test_data_factory):
        """Test certification upload with file too large."""
        # Create a test user first
        user_data = test_data_factory["user"]("cert_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a large test file (6MB)
        large_content = b"x" * (6 * 1024 * 1024)
        test_file = io.BytesIO(large_content)

        # Upload certification with large file
        response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("large_cert.pdf", test_file, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
        assert "File too large" in response.json()["detail"]

    def test_upload_profile_picture_success(self, client: TestClient, test_data_factory):
        """Test successful profile picture upload."""
        # Create a test user first
        user_data = test_data_factory["user"]("profile_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a test image file
        test_content = b"Test image content"
        test_file = io.BytesIO(test_content)

        # Upload profile picture
        response = client.post(
            "/api/v1/files/upload/profile-picture",
            files={"file": ("test_pic.jpg", test_file, "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "test_pic.jpg"
        assert data["file_size"] == len(test_content)
        assert data["content_type"] == "image/jpeg"
        assert "file_url" in data
        assert data["file_url"].startswith("/api/v1/files/profile-picture/")

    def test_upload_profile_picture_invalid_type(self, client: TestClient, test_data_factory):
        """Test profile picture upload with invalid file type."""
        # Create a test user first
        user_data = test_data_factory["user"]("profile_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a test file with invalid type
        test_content = b"Test content"
        test_file = io.BytesIO(test_content)

        # Upload profile picture with invalid type
        response = client.post(
            "/api/v1/files/upload/profile-picture",
            files={"file": ("test_pic.txt", test_file, "text/plain")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
        assert "File type not allowed" in response.json()["detail"]

    def test_upload_profile_picture_too_large(self, client: TestClient, test_data_factory):
        """Test profile picture upload with file too large."""
        # Create a test user first
        user_data = test_data_factory["user"]("profile_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a large test file (3MB)
        large_content = b"x" * (3 * 1024 * 1024)
        test_file = io.BytesIO(large_content)

        # Upload profile picture with large file
        response = client.post(
            "/api/v1/files/upload/profile-picture",
            files={"file": ("large_pic.jpg", test_file, "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 400
        assert "File too large" in response.json()["detail"]

    def test_upload_without_authentication(self, client: TestClient):
        """Test file upload without authentication."""
        # Create a test file
        test_content = b"Test content"
        test_file = io.BytesIO(test_content)

        # Try to upload without token
        response = client.post(
            "/api/v1/files/upload/certification", files={"file": ("test_cert.pdf", test_file, "application/pdf")}
        )

        assert response.status_code == 401

    def test_upload_with_invalid_token(self, client: TestClient):
        """Test file upload with invalid token."""
        # Create a test file
        test_content = b"Test content"
        test_file = io.BytesIO(test_content)

        # Try to upload with invalid token
        response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("test_cert.pdf", test_file, "application/pdf")},
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == 401


class TestFileRetrievalEndpoints:
    """Test file retrieval endpoints."""

    def test_get_profile_picture_success(self, client: TestClient, test_data_factory):
        """Test successful profile picture retrieval."""
        # Create a test user first
        user_data = test_data_factory["user"]("retrieve_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201
        user_id = register_response.json()["id"]

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Upload a profile picture first
        test_content = b"Test image content"
        test_file = io.BytesIO(test_content)

        upload_response = client.post(
            "/api/v1/files/upload/profile-picture",
            files={"file": ("test_pic.jpg", test_file, "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert upload_response.status_code == 200

        # Extract filename from upload response
        file_url = upload_response.json()["file_url"]
        filename = file_url.split("/")[-1]

        # Retrieve the profile picture
        response = client.get(f"/api/v1/files/profile-picture/{user_id}/{filename}")

        assert response.status_code == 200
        assert response.headers["content-type"] == "image/jpeg"

    def test_get_profile_picture_not_found(self, client: TestClient):
        """Test profile picture retrieval when file doesn't exist."""
        # Use a valid UUID format but non-existent file
        fake_user_id = str(uuid.uuid4())
        fake_filename = f"{uuid.uuid4()}.jpg"

        response = client.get(f"/api/v1/files/profile-picture/{fake_user_id}/{fake_filename}")

        assert response.status_code == 404
        assert "File not found" in response.json()["detail"]

    def test_get_profile_picture_invalid_user_id(self, client: TestClient):
        """Test profile picture retrieval with invalid user ID format."""
        fake_filename = f"{uuid.uuid4()}.jpg"

        response = client.get(f"/api/v1/files/profile-picture/invalid_user_id/{fake_filename}")

        assert response.status_code == 400
        assert "Invalid user ID format" in response.json()["detail"]

    def test_get_profile_picture_invalid_filename(self, client: TestClient):
        """Test profile picture retrieval with invalid filename."""
        fake_user_id = str(uuid.uuid4())

        response = client.get(f"/api/v1/files/profile-picture/{fake_user_id}/invalid_filename")

        assert response.status_code == 400
        assert "Invalid filename format" in response.json()["detail"]

    def test_get_certification_document_success(self, client: TestClient, test_data_factory):
        """Test successful certification document retrieval."""
        # Create a test user first
        user_data = test_data_factory["user"]("cert_retrieve_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201
        user_id = register_response.json()["id"]

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Upload a certification first
        test_content = b"Test PDF content"
        test_file = io.BytesIO(test_content)

        upload_response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("test_cert.pdf", test_file, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert upload_response.status_code == 200

        # Extract filename from upload response
        file_url = upload_response.json()["file_url"]
        filename = file_url.split("/")[-1]

        # Retrieve the certification
        response = client.get(f"/api/v1/files/certification/{user_id}/{filename}")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/octet-stream"

    def test_get_certification_document_not_found(self, client: TestClient):
        """Test certification document retrieval when file doesn't exist."""
        # Use a valid UUID format but non-existent file
        fake_user_id = str(uuid.uuid4())
        fake_filename = f"{uuid.uuid4()}.pdf"

        response = client.get(f"/api/v1/files/certification/{fake_user_id}/{fake_filename}")

        assert response.status_code == 404
        assert "File not found" in response.json()["detail"]


class TestFileDeletionEndpoints:
    """Test file deletion endpoints."""

    def test_delete_profile_picture_success(self, client: TestClient, test_data_factory):
        """Test successful profile picture deletion."""
        # Create a test user first
        user_data = test_data_factory["user"]("delete_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201
        user_id = register_response.json()["id"]

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Upload a profile picture first
        test_content = b"Test image content"
        test_file = io.BytesIO(test_content)

        upload_response = client.post(
            "/api/v1/files/upload/profile-picture",
            files={"file": ("test_pic.jpg", test_file, "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert upload_response.status_code == 200

        # Extract filename from upload response
        file_url = upload_response.json()["file_url"]
        filename = file_url.split("/")[-1]

        # Delete the profile picture
        response = client.delete(
            f"/api/v1/files/profile-picture/{user_id}/{filename}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert "File deleted successfully" in response.json()["message"]

    def test_delete_profile_picture_not_own_file(self, client: TestClient, test_data_factory):
        """Test profile picture deletion when trying to delete another user's file."""
        # Create two test users
        user1_data = test_data_factory["user"]("delete_user1")
        user2_data = test_data_factory["user"]("delete_user2")

        register1_response = client.post("/api/v1/auth/register/user", json=user1_data)
        register2_response = client.post("/api/v1/auth/register/user", json=user2_data)
        assert register1_response.status_code == 201
        assert register2_response.status_code == 201

        user1_id = register1_response.json()["id"]

        # Login as user1
        login1_response = client.post(
            "/api/v1/auth/login/user", json={"email": user1_data["email"], "password": user1_data["password"]}
        )
        assert login1_response.status_code == 200
        token1 = login1_response.json()["access_token"]

        # Upload a profile picture as user1
        test_content = b"Test image content"
        test_file = io.BytesIO(test_content)

        upload_response = client.post(
            "/api/v1/files/upload/profile-picture",
            files={"file": ("test_pic.jpg", test_file, "image/jpeg")},
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert upload_response.status_code == 200

        # Extract filename from upload response
        file_url = upload_response.json()["file_url"]
        filename = file_url.split("/")[-1]

        # Login as user2
        login2_response = client.post(
            "/api/v1/auth/login/user", json={"email": user2_data["email"], "password": user2_data["password"]}
        )
        assert login2_response.status_code == 200
        token2 = login2_response.json()["access_token"]

        # Try to delete user1's file as user2
        response = client.delete(
            f"/api/v1/files/profile-picture/{user1_id}/{filename}", headers={"Authorization": f"Bearer {token2}"}
        )

        assert response.status_code == 403
        assert "You can only delete your own files" in response.json()["detail"]

    def test_delete_profile_picture_not_found(self, client: TestClient, test_data_factory):
        """Test profile picture deletion when file doesn't exist."""
        # Create a test user first
        user_data = test_data_factory["user"]("delete_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201
        user_id = register_response.json()["id"]

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Try to delete non-existent file
        fake_filename = f"{uuid.uuid4()}.jpg"

        response = client.delete(
            f"/api/v1/files/profile-picture/{user_id}/{fake_filename}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404
        assert "File not found" in response.json()["detail"]

    def test_delete_certification_document_success(self, client: TestClient, test_data_factory):
        """Test successful certification document deletion."""
        # Create a test user first
        user_data = test_data_factory["user"]("delete_cert_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201
        user_id = register_response.json()["id"]

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Upload a certification first
        test_content = b"Test PDF content"
        test_file = io.BytesIO(test_content)

        upload_response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("test_cert.pdf", test_file, "application/pdf")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert upload_response.status_code == 200

        # Extract filename from upload response
        file_url = upload_response.json()["file_url"]
        filename = file_url.split("/")[-1]

        # Delete the certification
        response = client.delete(
            f"/api/v1/files/certification/{user_id}/{filename}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert "File deleted successfully" in response.json()["message"]

    def test_delete_certification_document_not_own_file(self, client: TestClient, test_data_factory):
        """Test certification deletion when trying to delete another user's file."""
        # Create two test users
        user1_data = test_data_factory["user"]("delete_cert_user1")
        user2_data = test_data_factory["user"]("delete_cert_user2")

        register1_response = client.post("/api/v1/auth/register/user", json=user1_data)
        register2_response = client.post("/api/v1/auth/register/user", json=user2_data)
        assert register1_response.status_code == 201
        assert register2_response.status_code == 201

        user1_id = register1_response.json()["id"]

        # Login as user1
        login1_response = client.post(
            "/api/v1/auth/login/user", json={"email": user1_data["email"], "password": user1_data["password"]}
        )
        assert login1_response.status_code == 200
        token1 = login1_response.json()["access_token"]

        # Upload a certification as user1
        test_content = b"Test PDF content"
        test_file = io.BytesIO(test_content)

        upload_response = client.post(
            "/api/v1/files/upload/certification",
            files={"file": ("test_cert.pdf", test_file, "application/pdf")},
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert upload_response.status_code == 200

        # Extract filename from upload response
        file_url = upload_response.json()["file_url"]
        filename = file_url.split("/")[-1]

        # Login as user2
        login2_response = client.post(
            "/api/v1/auth/login/user", json={"email": user2_data["email"], "password": user2_data["password"]}
        )
        assert login2_response.status_code == 200
        token2 = login2_response.json()["access_token"]

        # Try to delete user1's file as user2
        response = client.delete(
            f"/api/v1/files/certification/{user1_id}/{filename}", headers={"Authorization": f"Bearer {token2}"}
        )

        assert response.status_code == 403
        assert "You can only delete your own files" in response.json()["detail"]

    def test_delete_without_authentication(self, client: TestClient):
        """Test file deletion without authentication."""
        fake_user_id = str(uuid.uuid4())
        fake_filename = f"{uuid.uuid4()}.jpg"

        response = client.delete(f"/api/v1/files/profile-picture/{fake_user_id}/{fake_filename}")

        assert response.status_code == 401


class TestFileSecurityEndpoints:
    """Test file security and path traversal protection."""

    def test_path_traversal_attack_user_id(self, client: TestClient):
        """Test path traversal attack using user_id parameter."""
        fake_filename = f"{uuid.uuid4()}.jpg"

        # Try path traversal in user_id
        response = client.get(f"/api/v1/files/profile-picture/../../../etc/passwd/{fake_filename}")

        # FastAPI routing might return 404 for invalid paths, but should not crash
        assert response.status_code in [400, 404]

    def test_path_traversal_attack_filename(self, client: TestClient):
        """Test path traversal attack using filename parameter."""
        fake_user_id = str(uuid.uuid4())

        # Try path traversal in filename
        response = client.get(f"/api/v1/files/profile-picture/{fake_user_id}/../../../etc/passwd")

        # FastAPI routing might return 404 for invalid paths, but should not crash
        assert response.status_code in [400, 404]

    def test_invalid_filename_format(self, client: TestClient):
        """Test invalid filename format."""
        fake_user_id = str(uuid.uuid4())

        # Try invalid filename format
        response = client.get(f"/api/v1/files/profile-picture/{fake_user_id}/invalid_filename.txt")

        assert response.status_code == 400
        assert "Invalid filename format" in response.json()["detail"]

    def test_empty_filename(self, client: TestClient):
        """Test empty filename."""
        fake_user_id = str(uuid.uuid4())

        # Try empty filename
        response = client.get(f"/api/v1/files/profile-picture/{fake_user_id}/")

        assert response.status_code == 404  # FastAPI routing issue, but should not crash

    def test_special_characters_in_filename(self, client: TestClient):
        """Test special characters in filename."""
        fake_user_id = str(uuid.uuid4())

        # Try special characters in filename
        response = client.get(f"/api/v1/files/profile-picture/{fake_user_id}/file%20with%20spaces.jpg")

        assert response.status_code == 400
        assert "Invalid filename format" in response.json()["detail"]


class TestFileTypeValidation:
    """Test file type validation for different file types."""

    def test_certification_allowed_types(self, client: TestClient, test_data_factory):
        """Test all allowed certification file types."""
        # Create a test user first
        user_data = test_data_factory["user"]("filetype_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test allowed types
        allowed_types = [
            ("test.pdf", "application/pdf"),
            ("test.jpg", "image/jpeg"),
            ("test.jpeg", "image/jpeg"),
            ("test.png", "image/png"),
        ]

        for filename, content_type in allowed_types:
            test_content = b"Test content"
            test_file = io.BytesIO(test_content)

            response = client.post(
                "/api/v1/files/upload/certification",
                files={"file": (filename, test_file, content_type)},
                headers={"Authorization": f"Bearer {token}"},
            )

            assert response.status_code == 200, f"Failed for {filename} with {content_type}"

    def test_profile_picture_allowed_types(self, client: TestClient, test_data_factory):
        """Test all allowed profile picture file types."""
        # Create a test user first
        user_data = test_data_factory["user"]("profiletype_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test allowed types
        allowed_types = [
            ("test.jpg", "image/jpeg"),
            ("test.jpeg", "image/jpeg"),
            ("test.png", "image/png"),
            ("test.gif", "image/gif"),
        ]

        for filename, content_type in allowed_types:
            test_content = b"Test content"
            test_file = io.BytesIO(test_content)

            response = client.post(
                "/api/v1/files/upload/profile-picture",
                files={"file": (filename, test_file, content_type)},
                headers={"Authorization": f"Bearer {token}"},
            )

            assert response.status_code == 200, f"Failed for {filename} with {content_type}"

    def test_certification_disallowed_types(self, client: TestClient, test_data_factory):
        """Test disallowed certification file types."""
        # Create a test user first
        user_data = test_data_factory["user"]("disallowed_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test disallowed types
        disallowed_types = [
            ("test.txt", "text/plain"),
            ("test.doc", "application/msword"),
            ("test.gif", "image/gif"),
            ("test.exe", "application/octet-stream"),
        ]

        for filename, content_type in disallowed_types:
            test_content = b"Test content"
            test_file = io.BytesIO(test_content)

            response = client.post(
                "/api/v1/files/upload/certification",
                files={"file": (filename, test_file, content_type)},
                headers={"Authorization": f"Bearer {token}"},
            )

            assert response.status_code == 400, f"Should fail for {filename} with {content_type}"
            assert "File type not allowed" in response.json()["detail"]

    def test_profile_picture_disallowed_types(self, client: TestClient, test_data_factory):
        """Test disallowed profile picture file types."""
        # Create a test user first
        user_data = test_data_factory["user"]("disallowed_profile_user")
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        assert register_response.status_code == 201

        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test disallowed types
        disallowed_types = [
            ("test.txt", "text/plain"),
            ("test.pdf", "application/pdf"),
            ("test.doc", "application/msword"),
            ("test.exe", "application/octet-stream"),
        ]

        for filename, content_type in disallowed_types:
            test_content = b"Test content"
            test_file = io.BytesIO(test_content)

            response = client.post(
                "/api/v1/files/upload/profile-picture",
                files={"file": (filename, test_file, content_type)},
                headers={"Authorization": f"Bearer {token}"},
            )

            assert response.status_code == 400, f"Should fail for {filename} with {content_type}"
            assert "File type not allowed" in response.json()["detail"]
