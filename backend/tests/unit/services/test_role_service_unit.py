"""
Unit tests for RoleService.
"""

import uuid
from unittest.mock import MagicMock

import pytest
from sqlalchemy.orm import Session

from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate
from app.services.role_service import RoleService

pytestmark = pytest.mark.unit


class TestRoleServiceUnit:
    """Unit tests for RoleService."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        return MagicMock(spec=Session)

    @pytest.fixture
    def role_service(self, mock_db_session):
        """Create RoleService instance with mocked session."""
        return RoleService(mock_db_session)

    @pytest.fixture
    def sample_role(self):
        """Sample role object."""
        role = Role(
            id=uuid.UUID("11111111-1111-1111-1111-111111111111"), name="user", description="Usuario regular (paciente)"
        )
        return role

    def test_get_role_by_id_success(self, role_service, mock_db_session, sample_role):
        """Test getting role by ID successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_role

        # Act
        result = role_service.get_role_by_id(sample_role.id)

        # Assert
        mock_db_session.query.assert_called_once_with(Role)
        assert result == sample_role

    def test_get_role_by_id_not_found(self, role_service, mock_db_session):
        """Test getting role by ID when not found."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = role_service.get_role_by_id(uuid.uuid4())

        # Assert
        assert result is None

    def test_get_role_by_name_success(self, role_service, mock_db_session, sample_role):
        """Test getting role by name successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_role

        # Act
        result = role_service.get_role_by_name("user")

        # Assert
        mock_db_session.query.assert_called_once_with(Role)
        assert result == sample_role

    def test_get_role_by_name_not_found(self, role_service, mock_db_session):
        """Test getting role by name when not found."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = role_service.get_role_by_name("nonexistent")

        # Assert
        assert result is None

    def test_get_all_roles_success(self, role_service, mock_db_session):
        """Test getting all roles."""
        # Arrange
        roles = [
            Role(name="user", description="Usuario"),
            Role(name="professional", description="Profesional"),
            Role(name="admin", description="Administrador"),
        ]
        mock_db_session.query.return_value.all.return_value = roles

        # Act
        result = role_service.get_all_roles()

        # Assert
        mock_db_session.query.assert_called_once_with(Role)
        assert result == roles
        assert len(result) == 3

    def test_create_role_success(self, role_service, mock_db_session):
        """Test creating a role successfully."""
        # Arrange
        role_data = RoleCreate(name="moderator", description="Moderador del sistema")

        # Act
        result = role_service.create_role(role_data)

        # Assert
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
        assert result.name == "moderator"
        assert result.description == "Moderador del sistema"

    def test_update_role_success(self, role_service, mock_db_session, sample_role):
        """Test updating a role successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_role
        role_update = RoleUpdate(description="Updated description")

        # Act
        result = role_service.update_role(sample_role.id, role_update)

        # Assert
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
        assert result is not None

    def test_update_role_not_found(self, role_service, mock_db_session):
        """Test updating a role that doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = None
        role_update = RoleUpdate(description="Updated")

        # Act
        result = role_service.update_role(uuid.uuid4(), role_update)

        # Assert
        assert result is None
        mock_db_session.commit.assert_not_called()

    def test_delete_role_success(self, role_service, mock_db_session, sample_role):
        """Test deleting a role successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_role

        # Act
        result = role_service.delete_role(sample_role.id)

        # Assert
        mock_db_session.delete.assert_called_once_with(sample_role)
        mock_db_session.commit.assert_called_once()
        assert result is True

    def test_delete_role_not_found(self, role_service, mock_db_session):
        """Test deleting a role that doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = role_service.delete_role(uuid.uuid4())

        # Assert
        assert result is False
        mock_db_session.delete.assert_not_called()
        mock_db_session.commit.assert_not_called()

    def test_ensure_default_roles(self, role_service, mock_db_session):
        """Test ensuring default roles exist."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        role_service.ensure_default_roles()

        # Assert
        # Should be called 3 times (user, professional, admin)
        assert mock_db_session.add.call_count == 3
        assert mock_db_session.commit.call_count == 3

    def test_ensure_default_roles_already_exist(self, role_service, mock_db_session, sample_role):
        """Test ensuring default roles when they already exist."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_role

        # Act
        role_service.ensure_default_roles()

        # Assert
        # Should not create new roles if they already exist
        mock_db_session.add.assert_not_called()
