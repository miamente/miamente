"""
Unit tests for app.services.seed_demo_data module.
"""

import pytest
from unittest.mock import MagicMock, patch, call

from app.services.seed_demo_data import (
    get_or_create,
    seed_reference_data,
    seed_users,
    seed_professional,
    run,
    SPECIALTIES,
    APPROACHES,
    MODALITIES,
)


class TestGetOrCreate:
    """Test the get_or_create function."""

    def test_get_or_create_existing_record(self, db_session):
        """Test get_or_create when record already exists."""
        # Setup
        mock_instance = MagicMock()
        db_session.query.return_value.filter_by.return_value.first.return_value = mock_instance

        # Execute
        result, created = get_or_create(
            MagicMock, db_session, defaults={"field": "value"}, existing_field="existing_value"  # model
        )

        # Verify
        assert result is mock_instance
        assert created is False
        db_session.query.assert_called_once_with(MagicMock)
        db_session.query.return_value.filter_by.assert_called_once_with(existing_field="existing_value")
        db_session.add.assert_not_called()
        db_session.commit.assert_not_called()

    def test_get_or_create_new_record(self, db_session):
        """Test get_or_create when record doesn't exist."""
        # Setup
        db_session.query.return_value.filter_by.return_value.first.return_value = None

        # Execute - directly pass the mock instance instead of trying to patch MagicMock
        result, created = get_or_create(
            MagicMock, db_session, defaults={"default_field": "default_value"}, existing_field="new_value"  # model
        )

        # Verify
        assert result is not None
        assert created is True
        db_session.add.assert_called_once()
        db_session.commit.assert_called_once()
        db_session.refresh.assert_called_once()

    def test_get_or_create_new_record_without_defaults(self, db_session):
        """Test get_or_create when record doesn't exist and no defaults provided."""
        # Setup
        db_session.query.return_value.filter_by.return_value.first.return_value = None

        # Execute
        result, created = get_or_create(MagicMock, db_session, existing_field="new_value")  # model

        # Verify
        assert result is not None
        assert created is True
        db_session.add.assert_called_once()
        db_session.commit.assert_called_once()
        db_session.refresh.assert_called_once()

    def test_get_or_create_with_empty_defaults(self, db_session):
        """Test get_or_create with empty defaults dict."""
        # Setup
        db_session.query.return_value.filter_by.return_value.first.return_value = None

        # Execute
        result, created = get_or_create(MagicMock, db_session, defaults={}, existing_field="new_value")  # model

        # Verify
        assert result is not None
        assert created is True
        db_session.add.assert_called_once()
        db_session.commit.assert_called_once()
        db_session.refresh.assert_called_once()


class TestSeedReferenceData:
    """Test the seed_reference_data function."""

    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_reference_data_specialties(self, mock_get_or_create, db_session):
        """Test that specialties are seeded correctly."""
        # Execute
        seed_reference_data(db_session)

        # Verify specialties
        specialty_calls = [call for call in mock_get_or_create.call_args_list if call[0][0].__name__ == "Specialty"]

        assert len(specialty_calls) == len(SPECIALTIES)

        for i, specialty_name in enumerate(SPECIALTIES):
            call_args = specialty_calls[i][0]
            call_kwargs = specialty_calls[i][1]

            assert call_args[0].__name__ == "Specialty"
            assert call_args[1] is db_session
            assert call_kwargs["defaults"] == {"category": "General"}
            assert call_kwargs["name"] == specialty_name

    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_reference_data_approaches(self, mock_get_or_create, db_session):
        """Test that therapeutic approaches are seeded correctly."""
        # Execute
        seed_reference_data(db_session)

        # Verify therapeutic approaches
        approach_calls = [
            call for call in mock_get_or_create.call_args_list if call[0][0].__name__ == "TherapeuticApproach"
        ]

        assert len(approach_calls) == len(APPROACHES)

        for i, approach_name in enumerate(APPROACHES):
            call_args = approach_calls[i][0]
            call_kwargs = approach_calls[i][1]

            assert call_args[0].__name__ == "TherapeuticApproach"
            assert call_args[1] is db_session
            assert call_kwargs["defaults"] == {"description": approach_name, "category": None}
            assert call_kwargs["name"] == approach_name

    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_reference_data_modalities(self, mock_get_or_create, db_session):
        """Test that modalities are seeded correctly."""
        # Execute
        seed_reference_data(db_session)

        # Verify modalities
        modality_calls = [call for call in mock_get_or_create.call_args_list if call[0][0].__name__ == "Modality"]

        assert len(modality_calls) == len(MODALITIES)

        for i, modality_name in enumerate(MODALITIES):
            call_args = modality_calls[i][0]
            call_kwargs = modality_calls[i][1]

            assert call_args[0].__name__ == "Modality"
            assert call_args[1] is db_session
            assert call_kwargs["defaults"] == {"description": modality_name, "is_active": True}
            assert call_kwargs["name"] == modality_name


class TestSeedUsers:
    """Test the seed_users function."""

    @patch("app.services.seed_demo_data.get_password_hash")
    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_users(self, mock_get_or_create, mock_get_password_hash, db_session):
        """Test that demo users are seeded correctly."""
        # Setup
        mock_get_password_hash.return_value = "hashed_password"

        # Execute
        seed_users(db_session)

        # Verify
        mock_get_or_create.assert_called_once()
        call_args = mock_get_or_create.call_args[0]
        call_kwargs = mock_get_or_create.call_args[1]

        assert call_args[0].__name__ == "User"
        assert call_args[1] is db_session
        assert call_kwargs["email"] == "usuario.test@miamente.com"
        assert call_kwargs["defaults"] == {
            "hashed_password": "hashed_password",
            "full_name": "Usuario Test",
            "phone": "+573001234568",
            "is_active": True,
            "is_verified": True,
        }
        mock_get_password_hash.assert_called_once_with("test123456")


class TestSeedProfessional:
    """Test the seed_professional function."""

    @patch("app.services.seed_demo_data.get_password_hash")
    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_professional_with_specialty(self, mock_get_or_create, mock_get_password_hash, db_session):
        """Test that demo professional is seeded correctly with specialty."""
        # Setup
        mock_get_password_hash.return_value = "hashed_password"
        mock_specialty = MagicMock()
        mock_specialty.id = "specialty_id_123"
        db_session.query.return_value.filter_by.return_value.first.return_value = mock_specialty

        # Execute
        seed_professional(db_session)

        # Verify
        mock_get_or_create.assert_called_once()
        call_args = mock_get_or_create.call_args[0]
        call_kwargs = mock_get_or_create.call_args[1]

        assert call_args[0].__name__ == "Professional"
        assert call_args[1] is db_session
        assert call_kwargs["email"] == "dr.test@miamente.com"
        assert call_kwargs["defaults"] == {
            "hashed_password": "hashed_password",
            "full_name": "Dr. Test Professional",
            "phone": "+573001234567",
            "years_experience": 8,
            "rate_cents": 50000,
            "is_active": True,
            "is_verified": True,
            "specialty_ids": ["specialty_id_123"],
        }
        mock_get_password_hash.assert_called_once_with("test123456")

    @patch("app.services.seed_demo_data.get_password_hash")
    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_professional_without_specialty(self, mock_get_or_create, mock_get_password_hash, db_session):
        """Test that demo professional is seeded correctly without specialty."""
        # Setup
        mock_get_password_hash.return_value = "hashed_password"
        db_session.query.return_value.filter_by.return_value.first.return_value = None

        # Execute
        seed_professional(db_session)

        # Verify
        mock_get_or_create.assert_called_once()
        call_args = mock_get_or_create.call_args[0]
        call_kwargs = mock_get_or_create.call_args[1]

        assert call_args[0].__name__ == "Professional"
        assert call_args[1] is db_session
        assert call_kwargs["email"] == "dr.test@miamente.com"
        assert call_kwargs["defaults"] == {
            "hashed_password": "hashed_password",
            "full_name": "Dr. Test Professional",
            "phone": "+573001234567",
            "years_experience": 8,
            "rate_cents": 50000,
            "is_active": True,
            "is_verified": True,
            "specialty_ids": None,
        }

    @patch("app.services.seed_demo_data.get_password_hash")
    @patch("app.services.seed_demo_data.get_or_create")
    def test_seed_professional_specialty_without_id(self, mock_get_or_create, mock_get_password_hash, db_session):
        """Test that demo professional is seeded correctly when specialty has no id."""
        # Setup
        mock_get_password_hash.return_value = "hashed_password"
        mock_specialty = MagicMock()
        del mock_specialty.id  # Remove id attribute
        db_session.query.return_value.filter_by.return_value.first.return_value = mock_specialty

        # Execute
        seed_professional(db_session)

        # Verify
        mock_get_or_create.assert_called_once()
        call_kwargs = mock_get_or_create.call_args[1]

        assert call_kwargs["defaults"]["specialty_ids"] == [""]


class TestRun:
    """Test the run function."""

    @patch("app.services.seed_demo_data.get_session_factory")
    @patch("app.services.seed_demo_data.seed_professional")
    @patch("app.services.seed_demo_data.seed_users")
    @patch("app.services.seed_demo_data.seed_reference_data")
    @patch("builtins.print")
    def test_run_success(
        self, mock_print, mock_seed_reference, mock_seed_users, mock_seed_professional, mock_get_session_factory
    ):
        """Test successful execution of run function."""
        # Setup
        mock_session = MagicMock()
        mock_session_factory = MagicMock()
        mock_session_factory.return_value = mock_session
        mock_get_session_factory.return_value = mock_session_factory

        # Execute
        run()

        # Verify
        mock_get_session_factory.assert_called_once()
        mock_session_factory.assert_called_once()
        mock_seed_reference.assert_called_once_with(mock_session)
        mock_seed_users.assert_called_once_with(mock_session)
        mock_seed_professional.assert_called_once_with(mock_session)
        mock_session.close.assert_called_once()
        mock_print.assert_called_once_with("✅ Demo data seeded")

    @patch("app.services.seed_demo_data.get_session_factory")
    @patch("app.services.seed_demo_data.seed_professional")
    @patch("app.services.seed_demo_data.seed_users")
    @patch("app.services.seed_demo_data.seed_reference_data")
    @patch("builtins.print")
    def test_run_with_exception(
        self, mock_print, mock_seed_reference, mock_seed_users, mock_seed_professional, mock_get_session_factory
    ):
        """Test run function when exception occurs."""
        # Setup
        mock_session = MagicMock()
        mock_session_factory = MagicMock()
        mock_session_factory.return_value = mock_session
        mock_get_session_factory.return_value = mock_session_factory
        mock_seed_reference.side_effect = Exception("Database error")

        # Execute
        with pytest.raises(Exception, match="Database error"):
            run()

        # Verify that session.close() is still called in finally block
        mock_session.close.assert_called_once()
        mock_print.assert_not_called()

    @patch("app.services.seed_demo_data.get_session_factory")
    def test_run_no_session_factory(self, mock_get_session_factory):
        """Test run function when session factory is None."""
        # Setup
        mock_get_session_factory.return_value = None

        # Execute
        with pytest.raises(TypeError):
            run()


class TestConstants:
    """Test the constants defined in the module."""

    def test_specialties_constant(self):
        """Test that SPECIALTIES constant contains expected values."""
        assert isinstance(SPECIALTIES, list)
        assert len(SPECIALTIES) > 0
        assert "Psiquiatría" in SPECIALTIES
        assert "Psicología clínica" in SPECIALTIES
        assert "Neuropsicología" in SPECIALTIES

    def test_approaches_constant(self):
        """Test that APPROACHES constant contains expected values."""
        assert isinstance(APPROACHES, list)
        assert len(APPROACHES) > 0
        assert "Cognitivo-conductual (TCC)" in APPROACHES
        assert "Psicoanalítico / Psicodinámico" in APPROACHES
        assert "Integrativo (combinación de enfoques)" in APPROACHES

    def test_modalities_constant(self):
        """Test that MODALITIES constant contains expected values."""
        assert isinstance(MODALITIES, list)
        assert len(MODALITIES) > 0
        assert "Individual" in MODALITIES
        assert "Pareja" in MODALITIES
        assert "Online / Teleterapia" in MODALITIES


class TestSeedDemoDataIntegration:
    """Integration tests for seed demo data functionality."""

    @patch("app.services.seed_demo_data.get_or_create")
    def test_full_seeding_process(self, mock_get_or_create, db_session):
        """Test the complete seeding process."""
        # Setup
        mock_get_or_create.return_value = (MagicMock(), True)

        # Execute all seeding functions
        seed_reference_data(db_session)
        seed_users(db_session)
        seed_professional(db_session)

        # Verify total calls
        total_calls = len(SPECIALTIES) + len(APPROACHES) + len(MODALITIES) + 2  # +2 for user and professional
        assert mock_get_or_create.call_count == total_calls

    @patch("app.services.seed_demo_data.get_password_hash")
    @patch("app.services.seed_demo_data.get_or_create")
    def test_password_hashing_integration(self, mock_get_or_create, mock_get_password_hash, db_session):
        """Test that password hashing is called correctly in integration."""
        # Setup
        mock_get_or_create.return_value = (MagicMock(), True)
        mock_get_password_hash.return_value = "hashed_password"

        # Execute
        seed_users(db_session)
        seed_professional(db_session)

        # Verify password hashing calls
        assert mock_get_password_hash.call_count == 2
        mock_get_password_hash.assert_has_calls(
            [
                call("test123456"),
                call("test123456"),
            ]
        )
