"""
Unit tests for data parsing utilities.
"""

import json
import pytest
from unittest.mock import Mock, patch
from datetime import datetime

from app.utils.parsers import parse_professional_data, parse_user_data
from app.models.professional import Professional
from app.models.user import User
from app.models.professional_specialty import ProfessionalSpecialty
from app.models.professional_modality import ProfessionalModality
from app.models.specialty import Specialty
from app.models.modality import Modality


class TestParseProfessionalData:
    """Test cases for parse_professional_data function."""

    def test_parse_professional_data_basic(self):
        """Test parsing professional data with basic information."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1", "Cert2"]
        mock_professional.languages = ["English", "Spanish"]
        mock_professional.therapy_approaches_ids = ["approach1", "approach2"]
        mock_professional.specialty_ids = ["specialty1", "specialty2"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = '{"monday": "9-17"}'
        mock_professional.profile_picture = "profile.jpg"
        mock_professional.is_active = True
        mock_professional.is_verified = True
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)
        mock_professional.professional_specialties = []
        mock_professional.professional_modalities = []

        # Act
        result = parse_professional_data(mock_professional)

        # Assert
        assert result["id"] == "prof123"
        assert result["email"] == "test@example.com"
        assert result["full_name"] == "Test Professional"
        assert result["phone_country_code"] == "+1"
        assert result["phone_number"] == "1234567890"
        assert result["license_number"] == "LIC123"
        assert result["years_experience"] == 5
        assert result["rate_cents"] == 10000
        assert result["currency"] == "USD"
        assert result["bio"] == "Test bio"
        assert result["academic_experience"] == "Test academic"
        assert result["work_experience"] == "Test work"
        assert result["certifications"] == ["Cert1", "Cert2"]
        assert result["languages"] == ["English", "Spanish"]
        assert result["therapy_approaches_ids"] == ["approach1", "approach2"]
        assert result["specialty_ids"] == ["specialty1", "specialty2"]
        assert result["timezone"] == "UTC"
        assert result["working_hours"] == {"monday": "9-17"}
        assert result["profile_picture"] == "profile.jpg"
        assert result["is_active"] is True
        assert result["is_verified"] is True
        assert result["created_at"] == datetime(2023, 1, 1)
        assert result["updated_at"] == datetime(2023, 1, 2)
        assert result["professional_specialties"] == []
        assert result["modalities"] == []

    def test_parse_professional_data_with_specialties(self):
        """Test parsing professional data with specialties."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1"]
        mock_professional.languages = ["English"]
        mock_professional.therapy_approaches_ids = ["approach1"]
        mock_professional.specialty_ids = ["specialty1"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = None
        mock_professional.profile_picture = None
        mock_professional.is_active = True
        mock_professional.is_verified = False
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)

        # Mock specialty
        mock_specialty = Mock(spec=Specialty)
        mock_specialty.name = "Psychology"
        mock_specialty.category = "Mental Health"

        # Mock professional specialty
        mock_prof_specialty = Mock(spec=ProfessionalSpecialty)
        mock_prof_specialty.id = "ps123"
        mock_prof_specialty.specialty = mock_specialty

        mock_professional.professional_specialties = [mock_prof_specialty]
        mock_professional.professional_modalities = []

        # Act
        result = parse_professional_data(mock_professional)

        # Assert
        assert len(result["professional_specialties"]) == 1
        specialty = result["professional_specialties"][0]
        assert specialty["id"] == "ps123"
        assert specialty["name"] == "Psychology"
        assert specialty["description"] == "Mental Health"
        assert specialty["price_cents"] == 10000
        assert specialty["currency"] == "USD"
        assert specialty["is_default"] is False
        assert specialty["is_active"] is True

    def test_parse_professional_data_with_modalities(self):
        """Test parsing professional data with modalities."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1"]
        mock_professional.languages = ["English"]
        mock_professional.therapy_approaches_ids = ["approach1"]
        mock_professional.specialty_ids = ["specialty1"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = None
        mock_professional.profile_picture = None
        mock_professional.is_active = True
        mock_professional.is_verified = False
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)

        # Mock modality
        mock_modality = Mock(spec=Modality)
        mock_modality.id = "mod123"

        # Mock professional modality
        mock_prof_modality = Mock(spec=ProfessionalModality)
        mock_prof_modality.id = "pm123"
        mock_prof_modality.modality_id = "mod123"
        mock_prof_modality.modality_name = "Online Therapy"
        mock_prof_modality.virtual_price = 8000
        mock_prof_modality.presencial_price = 12000
        mock_prof_modality.offers_presencial = True
        mock_prof_modality.description = "Online therapy sessions"
        mock_prof_modality.is_default = True
        mock_prof_modality.is_active = True

        mock_professional.professional_specialties = []
        mock_professional.professional_modalities = [mock_prof_modality]

        # Act
        result = parse_professional_data(mock_professional)

        # Assert
        assert len(result["modalities"]) == 1
        modality = result["modalities"][0]
        assert modality["id"] == "pm123"
        assert modality["modalityId"] == "mod123"
        assert modality["modalityName"] == "Online Therapy"
        assert modality["virtualPrice"] == 8000
        assert modality["presencialPrice"] == 12000
        assert modality["offersPresencial"] is True
        assert modality["description"] == "Online therapy sessions"
        assert modality["isDefault"] is True

    def test_parse_professional_data_inactive_modality(self):
        """Test that inactive modalities are excluded."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1"]
        mock_professional.languages = ["English"]
        mock_professional.therapy_approaches_ids = ["approach1"]
        mock_professional.specialty_ids = ["specialty1"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = None
        mock_professional.profile_picture = None
        mock_professional.is_active = True
        mock_professional.is_verified = False
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)

        # Mock inactive professional modality
        mock_prof_modality = Mock(spec=ProfessionalModality)
        mock_prof_modality.id = "pm123"
        mock_prof_modality.modality_id = "mod123"
        mock_prof_modality.modality_name = "Online Therapy"
        mock_prof_modality.virtual_price = 8000
        mock_prof_modality.presencial_price = 12000
        mock_prof_modality.offers_presencial = True
        mock_prof_modality.description = "Online therapy sessions"
        mock_prof_modality.is_default = True
        mock_prof_modality.is_active = False  # Inactive

        mock_professional.professional_specialties = []
        mock_professional.professional_modalities = [mock_prof_modality]

        # Act
        result = parse_professional_data(mock_professional)

        # Assert
        assert result["modalities"] == []

    def test_parse_professional_data_specialty_without_specialty(self):
        """Test handling of professional specialty without specialty object."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1"]
        mock_professional.languages = ["English"]
        mock_professional.therapy_approaches_ids = ["approach1"]
        mock_professional.specialty_ids = ["specialty1"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = None
        mock_professional.profile_picture = None
        mock_professional.is_active = True
        mock_professional.is_verified = False
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)

        # Mock professional specialty without specialty
        mock_prof_specialty = Mock(spec=ProfessionalSpecialty)
        mock_prof_specialty.id = "ps123"
        mock_prof_specialty.specialty = None  # No specialty

        mock_professional.professional_specialties = [mock_prof_specialty]
        mock_professional.professional_modalities = []

        # Act
        result = parse_professional_data(mock_professional)

        # Assert
        assert result["professional_specialties"] == []

    def test_parse_professional_data_none_working_hours(self):
        """Test handling of None working hours."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1"]
        mock_professional.languages = ["English"]
        mock_professional.therapy_approaches_ids = ["approach1"]
        mock_professional.specialty_ids = ["specialty1"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = None
        mock_professional.profile_picture = None
        mock_professional.is_active = True
        mock_professional.is_verified = False
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)
        mock_professional.professional_specialties = []
        mock_professional.professional_modalities = []

        # Act
        result = parse_professional_data(mock_professional)

        # Assert
        assert result["working_hours"] is None

    def test_parse_professional_data_invalid_json_working_hours(self):
        """Test handling of invalid JSON in working hours."""
        # Arrange
        mock_professional = Mock(spec=Professional)
        mock_professional.id = "prof123"
        mock_professional.email = "test@example.com"
        mock_professional.full_name = "Test Professional"
        mock_professional.phone_country_code = "+1"
        mock_professional.phone_number = "1234567890"
        mock_professional.license_number = "LIC123"
        mock_professional.years_experience = 5
        mock_professional.rate_cents = 10000
        mock_professional.currency = "USD"
        mock_professional.bio = "Test bio"
        mock_professional.academic_experience = "Test academic"
        mock_professional.work_experience = "Test work"
        mock_professional.certifications = ["Cert1"]
        mock_professional.languages = ["English"]
        mock_professional.therapy_approaches_ids = ["approach1"]
        mock_professional.specialty_ids = ["specialty1"]
        mock_professional.timezone = "UTC"
        mock_professional.working_hours = "invalid json"
        mock_professional.profile_picture = None
        mock_professional.is_active = True
        mock_professional.is_verified = False
        mock_professional.created_at = datetime(2023, 1, 1)
        mock_professional.updated_at = datetime(2023, 1, 2)
        mock_professional.professional_specialties = []
        mock_professional.professional_modalities = []

        # Act & Assert
        with pytest.raises(json.JSONDecodeError):
            parse_professional_data(mock_professional)


class TestParseUserData:
    """Test cases for parse_user_data function."""

    def test_parse_user_data_basic(self):
        """Test parsing user data with basic information."""
        # Arrange
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "user@example.com"
        mock_user.full_name = "Test User"
        mock_user.phone = "+1234567890"
        mock_user.is_active = True
        mock_user.is_verified = True
        mock_user.role = Mock()
        mock_user.role.value = "user"
        mock_user.profile_picture = "profile.jpg"
        mock_user.date_of_birth = datetime(1990, 1, 1)
        mock_user.emergency_contact = "Emergency Contact"
        mock_user.emergency_phone = "+1987654321"
        mock_user.preferences = {"theme": "dark"}
        mock_user.created_at = datetime(2023, 1, 1)
        mock_user.updated_at = datetime(2023, 1, 2)

        # Act
        result = parse_user_data(mock_user)

        # Assert
        assert result["id"] == "user123"
        assert result["email"] == "user@example.com"
        assert result["full_name"] == "Test User"
        assert result["phone"] == "+1234567890"
        assert result["is_active"] is True
        assert result["is_verified"] is True
        assert result["role"] == "user"
        assert result["profile_picture"] == "profile.jpg"
        assert result["date_of_birth"] == datetime(1990, 1, 1)
        assert result["emergency_contact"] == "Emergency Contact"
        assert result["emergency_phone"] == "+1987654321"
        assert result["preferences"] == {"theme": "dark"}
        assert result["created_at"] == datetime(2023, 1, 1)
        assert result["updated_at"] == datetime(2023, 1, 2)

    def test_parse_user_data_none_role(self):
        """Test parsing user data with None role."""
        # Arrange
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "user@example.com"
        mock_user.full_name = "Test User"
        mock_user.phone = "+1234567890"
        mock_user.is_active = True
        mock_user.is_verified = False
        mock_user.role = None
        mock_user.profile_picture = None
        mock_user.date_of_birth = None
        mock_user.emergency_contact = None
        mock_user.emergency_phone = None
        mock_user.preferences = None
        mock_user.created_at = datetime(2023, 1, 1)
        mock_user.updated_at = datetime(2023, 1, 2)

        # Act
        result = parse_user_data(mock_user)

        # Assert
        assert result["role"] == "user"  # Default value when role is None

    def test_parse_user_data_admin_role(self):
        """Test parsing user data with admin role."""
        # Arrange
        mock_user = Mock(spec=User)
        mock_user.id = "admin123"
        mock_user.email = "admin@example.com"
        mock_user.full_name = "Admin User"
        mock_user.phone = "+1234567890"
        mock_user.is_active = True
        mock_user.is_verified = True
        mock_user.role = Mock()
        mock_user.role.value = "admin"
        mock_user.profile_picture = "admin.jpg"
        mock_user.date_of_birth = datetime(1985, 5, 15)
        mock_user.emergency_contact = "Admin Emergency"
        mock_user.emergency_phone = "+1987654321"
        mock_user.preferences = {"theme": "light", "notifications": True}
        mock_user.created_at = datetime(2023, 1, 1)
        mock_user.updated_at = datetime(2023, 1, 2)

        # Act
        result = parse_user_data(mock_user)

        # Assert
        assert result["role"] == "admin"
        assert result["preferences"] == {"theme": "light", "notifications": True}

    def test_parse_user_data_minimal_data(self):
        """Test parsing user data with minimal required fields."""
        # Arrange
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "user@example.com"
        mock_user.full_name = "Test User"
        mock_user.phone = None
        mock_user.is_active = False
        mock_user.is_verified = False
        mock_user.role = None
        mock_user.profile_picture = None
        mock_user.date_of_birth = None
        mock_user.emergency_contact = None
        mock_user.emergency_phone = None
        mock_user.preferences = None
        mock_user.created_at = datetime(2023, 1, 1)
        mock_user.updated_at = datetime(2023, 1, 2)

        # Act
        result = parse_user_data(mock_user)

        # Assert
        assert result["id"] == "user123"
        assert result["email"] == "user@example.com"
        assert result["full_name"] == "Test User"
        assert result["phone"] is None
        assert result["is_active"] is False
        assert result["is_verified"] is False
        assert result["role"] == "user"
        assert result["profile_picture"] is None
        assert result["date_of_birth"] is None
        assert result["emergency_contact"] is None
        assert result["emergency_phone"] is None
        assert result["preferences"] is None
