"""
Unit tests for app.core.config module.
"""

import os
import pytest
from unittest.mock import patch

from app.core.config import (
    Settings,
    get_settings,
    clear_settings_cache,
    reload_settings,
    configure_logging,
)


class TestSettings:
    """Test the Settings class."""

    def test_default_values(self):
        """Test that default values are set correctly."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings()

            assert settings.PROJECT_NAME == "Miamente Backend"
            assert settings.VERSION == "0.1.0"
            assert settings.API_V1_STR == "/api/v1"
            assert settings.DEBUG is False
            assert settings.SERVER_NAME == "localhost"
            assert settings.SERVER_HOST == "http://localhost:8000"
            assert settings.DATABASE_HOST == "localhost"
            assert settings.DATABASE_PORT == 5432
            assert settings.DATABASE_NAME == "miamente"
            assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 60 * 24 * 8
            assert settings.REFRESH_TOKEN_EXPIRE_MINUTES == 60 * 24 * 30
            assert settings.ALGORITHM == "HS256"
            assert settings.TIMEZONE == "America/Bogota"

    def test_secret_key_generation(self):
        """Test that SECRET_KEY is generated."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings()
            assert settings.SECRET_KEY is not None
            assert len(settings.SECRET_KEY) > 0

    def test_cors_origins_wildcard(self):
        """Test CORS origins with wildcard."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(BACKEND_CORS_ORIGINS="*")
            assert settings.BACKEND_CORS_ORIGINS == ["*"]

    def test_cors_origins_csv(self):
        """Test CORS origins with CSV string."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(BACKEND_CORS_ORIGINS="http://localhost:3000,https://example.com")
            assert settings.BACKEND_CORS_ORIGINS == ["http://localhost:3000", "https://example.com"]

    def test_cors_origins_list(self):
        """Test CORS origins with list."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            origins = ["http://localhost:3000", "https://example.com"]
            settings = Settings(BACKEND_CORS_ORIGINS=origins)
            assert settings.BACKEND_CORS_ORIGINS == origins

    def test_cors_origins_invalid_type(self):
        """Test CORS origins with invalid type."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            with pytest.raises(ValueError, match="Invalid BACKEND_CORS_ORIGINS"):
                Settings(BACKEND_CORS_ORIGINS=123)

    def test_allowed_hosts_wildcard(self):
        """Test allowed hosts with wildcard."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(ALLOWED_HOSTS="*")
            assert settings.ALLOWED_HOSTS == ["*"]

    def test_allowed_hosts_csv(self):
        """Test allowed hosts with CSV string."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(ALLOWED_HOSTS="localhost,example.com")
            assert settings.ALLOWED_HOSTS == ["localhost", "example.com"]

    def test_allowed_hosts_list(self):
        """Test allowed hosts with list."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            hosts = ["localhost", "example.com"]
            settings = Settings(ALLOWED_HOSTS=hosts)
            assert settings.ALLOWED_HOSTS == hosts

    def test_allowed_hosts_invalid_type(self):
        """Test allowed hosts with invalid type."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            with pytest.raises(ValueError, match="Invalid ALLOWED_HOSTS"):
                Settings(ALLOWED_HOSTS=123)

    def test_database_url_construction(self):
        """Test DATABASE_URL construction from components."""
        with patch.dict(
            os.environ,
            {
                "DATABASE_USER": "test_user",
                "DATABASE_PASSWORD": "test_password",
                "DATABASE_HOST": "test_host",
                "DATABASE_PORT": "5433",
                "DATABASE_NAME": "test_db",
            },
            clear=True,
        ):
            settings = Settings()
            expected_url = "postgresql://test_user:test_password@test_host:5433/test_db"
            assert settings.DATABASE_URL == expected_url

    def test_database_url_provided(self):
        """Test when DATABASE_URL is provided directly."""
        with patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@host:5432/db"}, clear=True):
            settings = Settings()
            assert settings.DATABASE_URL == "postgresql://user:pass@host:5432/db"

    def test_database_credentials_validation_missing(self):
        """Test validation when database credentials are missing."""
        with patch.dict(os.environ, {"DATABASE_USER": "", "DATABASE_PASSWORD": "", "DATABASE_URL": ""}, clear=True):
            with pytest.raises(ValueError, match="Database credentials must be provided"):
                Settings()

    def test_database_credentials_validation_partial(self):
        """Test validation when only one credential is provided."""
        with patch.dict(
            os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "", "DATABASE_URL": ""}, clear=True
        ):
            with pytest.raises(ValueError, match="Database credentials must be provided"):
                Settings()

    def test_cors_allow_all_property(self):
        """Test cors_allow_all property."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(BACKEND_CORS_ORIGINS="*")
            assert settings.cors_allow_all is True

            settings = Settings(BACKEND_CORS_ORIGINS="http://localhost:3000")
            assert settings.cors_allow_all is False

    def test_hosts_allow_all_property(self):
        """Test hosts_allow_all property."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(ALLOWED_HOSTS="*")
            assert settings.hosts_allow_all is True

            settings = Settings(ALLOWED_HOSTS="localhost")
            assert settings.hosts_allow_all is False


class TestSettingsFunctions:
    """Test settings utility functions."""

    @patch("app.core.config.logger")
    def test_get_settings_caching(self, mock_logger):
        """Test that get_settings returns cached instance."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            # Clear any existing cache
            clear_settings_cache()

            settings1 = get_settings()
            settings2 = get_settings()

            # Should be the same instance due to caching
            assert settings1 is settings2
            assert mock_logger.info.call_count >= 1

    @patch("app.core.config.logger")
    def test_clear_settings_cache(self, mock_logger):
        """Test clearing settings cache."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            get_settings()
            clear_settings_cache()
            assert mock_logger.info.called

    @patch("app.core.config.logger")
    def test_reload_settings(self, mock_logger):
        """Test reloading settings."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = reload_settings()
            assert settings is not None
            assert mock_logger.info.call_count >= 2


class TestConfigureLogging:
    """Test logging configuration."""

    @patch("app.core.config.logging.basicConfig")
    @patch("app.core.config.logger")
    def test_configure_logging_default(self, mock_logger, mock_basic_config):
        """Test logging configuration with default level."""
        with patch.dict(os.environ, {}, clear=True):
            result = configure_logging()

            assert result == "INFO"
            mock_basic_config.assert_called_once()
            mock_logger.info.assert_called_once()

    @patch("app.core.config.logging.basicConfig")
    @patch("app.core.config.logger")
    def test_configure_logging_custom_level(self, mock_logger, mock_basic_config):
        """Test logging configuration with custom level."""
        with patch.dict(os.environ, {"LOG_LEVEL": "DEBUG"}, clear=True):
            result = configure_logging()

            assert result == "DEBUG"
            mock_basic_config.assert_called_once()
            mock_logger.info.assert_called_once()

    @patch("app.core.config.logging.basicConfig")
    @patch("app.core.config.logger")
    def test_configure_logging_invalid_level(self, mock_logger, mock_basic_config):
        """Test logging configuration with invalid level."""
        with patch.dict(os.environ, {"LOG_LEVEL": "INVALID"}, clear=True):
            result = configure_logging()

            assert result == "INVALID"
            mock_basic_config.assert_called_once()
            mock_logger.info.assert_called_once()


class TestSettingsEdgeCases:
    """Test edge cases and error conditions."""

    def test_cors_origins_empty_string(self):
        """Test CORS origins with empty string."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(BACKEND_CORS_ORIGINS="")
            assert settings.BACKEND_CORS_ORIGINS == []

    def test_cors_origins_whitespace(self):
        """Test CORS origins with whitespace."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(BACKEND_CORS_ORIGINS="  http://localhost:3000  ,  https://example.com  ")
            assert settings.BACKEND_CORS_ORIGINS == ["http://localhost:3000", "https://example.com"]

    def test_allowed_hosts_empty_string(self):
        """Test allowed hosts with empty string."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(ALLOWED_HOSTS="")
            assert settings.ALLOWED_HOSTS == []

    def test_allowed_hosts_whitespace(self):
        """Test allowed hosts with whitespace."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(ALLOWED_HOSTS="  localhost  ,  example.com  ")
            assert settings.ALLOWED_HOSTS == ["localhost", "example.com"]

    def test_cors_origins_list_with_empty_items(self):
        """Test CORS origins list with empty items."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(BACKEND_CORS_ORIGINS=["http://localhost:3000", "", "https://example.com", "   "])
            assert settings.BACKEND_CORS_ORIGINS == ["http://localhost:3000", "https://example.com"]

    def test_allowed_hosts_list_with_empty_items(self):
        """Test allowed hosts list with empty items."""
        with patch.dict(os.environ, {"DATABASE_USER": "test_user", "DATABASE_PASSWORD": "test_password"}, clear=True):
            settings = Settings(ALLOWED_HOSTS=["localhost", "", "example.com", "   "])
            assert settings.ALLOWED_HOSTS == ["localhost", "example.com"]
