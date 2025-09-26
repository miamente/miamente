"""
Unit tests for app.core.database module.
"""

from unittest.mock import patch, MagicMock, call
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import (
    get_engine,
    get_session_factory,
    get_db,
    Base,
)


class TestGetEngine:
    """Test the get_engine function."""

    @patch("app.core.database.get_settings")
    @patch("app.core.database.create_engine")
    @patch("app.core.database.logger")
    def test_get_engine_success(self, mock_logger, mock_create_engine, mock_get_settings):
        """Test successful engine creation."""
        # Clear cache before test
        get_engine.cache_clear()

        # Setup
        mock_settings = MagicMock()
        mock_settings.DATABASE_URL = "postgresql://user:pass@host:5432/db"
        mock_settings.DEBUG = False
        mock_get_settings.return_value = mock_settings

        mock_engine = MagicMock(spec=Engine)
        mock_create_engine.return_value = mock_engine

        # Execute
        result = get_engine()

        # Verify
        assert result is mock_engine
        mock_create_engine.assert_called_once_with(
            "postgresql://user:pass@host:5432/db",
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_timeout=30,
            echo=False,
        )
        mock_logger.info.assert_has_calls(
            [
                call("DATABASE: Creating database engine"),
                call("DATABASE: Database engine created successfully"),
            ]
        )

    @patch("app.core.database.get_settings")
    @patch("app.core.database.create_engine")
    @patch("app.core.database.logger")
    def test_get_engine_debug_mode(self, mock_logger, mock_create_engine, mock_get_settings):
        """Test engine creation with debug mode enabled."""
        # Setup
        get_engine.cache_clear()  # Clear cache to ensure fresh test

        mock_settings = MagicMock()
        mock_settings.DATABASE_URL = "postgresql://user:pass@host:5432/db"
        mock_settings.DEBUG = True
        mock_get_settings.return_value = mock_settings

        mock_engine = MagicMock(spec=Engine)
        mock_create_engine.return_value = mock_engine

        # Execute
        result = get_engine()

        # Verify
        assert result is mock_engine
        mock_create_engine.assert_called_once_with(
            "postgresql://user:pass@host:5432/db",
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_timeout=30,
            echo=True,
        )

    @patch("app.core.database.get_settings")
    @patch("app.core.database.create_engine")
    @patch("app.core.database.logger")
    def test_get_engine_sqlalchemy_error(self, mock_logger, mock_create_engine, mock_get_settings):
        """Test engine creation with SQLAlchemy error."""
        # Setup
        get_engine.cache_clear()  # Clear cache to ensure fresh test

        mock_settings = MagicMock()
        mock_settings.DATABASE_URL = "postgresql://user:pass@host:5432/db"
        mock_settings.DEBUG = False
        mock_get_settings.return_value = mock_settings

        mock_create_engine.side_effect = SQLAlchemyError("Connection failed")

        # Execute
        result = get_engine()

        # Verify
        assert result is None
        assert mock_logger.error.call_count == 2
        # Check that error logging was called with the right messages
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Failed to create database engine" in str(calls[0])
        assert "SQLAlchemyError" in str(calls[1])

    @patch("app.core.database.get_settings")
    @patch("app.core.database.create_engine")
    @patch("app.core.database.logger")
    def test_get_engine_connection_error(self, mock_logger, mock_create_engine, mock_get_settings):
        """Test engine creation with connection error."""
        # Setup
        get_engine.cache_clear()  # Clear cache to ensure fresh test

        mock_settings = MagicMock()
        mock_settings.DATABASE_URL = "postgresql://user:pass@host:5432/db"
        mock_settings.DEBUG = False
        mock_get_settings.return_value = mock_settings

        mock_create_engine.side_effect = ConnectionError("Network error")

        # Execute
        result = get_engine()

        # Verify
        assert result is None
        assert mock_logger.error.call_count == 2
        # Check that error logging was called with the right messages
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Failed to create database engine" in str(calls[0])
        assert "ConnectionError" in str(calls[1])

    @patch("app.core.database.get_settings")
    @patch("app.core.database.create_engine")
    @patch("app.core.database.logger")
    def test_get_engine_timeout_error(self, mock_logger, mock_create_engine, mock_get_settings):
        """Test engine creation with timeout error."""
        # Setup
        get_engine.cache_clear()  # Clear cache to ensure fresh test

        mock_settings = MagicMock()
        mock_settings.DATABASE_URL = "postgresql://user:pass@host:5432/db"
        mock_settings.DEBUG = False
        mock_get_settings.return_value = mock_settings

        mock_create_engine.side_effect = TimeoutError("Timeout")

        # Execute
        result = get_engine()

        # Verify
        assert result is None
        assert mock_logger.error.call_count == 2
        # Check that error logging was called with the right messages
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Failed to create database engine" in str(calls[0])
        assert "TimeoutError" in str(calls[1])

    def test_get_engine_caching(self):
        """Test that get_engine returns cached instance."""
        with patch("app.core.database.get_settings") as mock_get_settings:
            mock_settings = MagicMock()
            mock_settings.DATABASE_URL = "postgresql://user:pass@host:5432/db"
            mock_settings.DEBUG = False
            mock_get_settings.return_value = mock_settings

            with patch("app.core.database.create_engine") as mock_create_engine:
                mock_engine = MagicMock(spec=Engine)
                mock_create_engine.return_value = mock_engine

                # Clear cache and get engine twice
                get_engine.cache_clear()
                engine1 = get_engine()
                engine2 = get_engine()

                # Should be the same instance due to caching
                assert engine1 is engine2
                # create_engine should only be called once
                assert mock_create_engine.call_count == 1


class TestGetSessionFactory:
    """Test the get_session_factory function."""

    @patch("app.core.database.get_engine")
    @patch("app.core.database.sessionmaker")
    @patch("app.core.database.logger")
    def test_get_session_factory_success(self, mock_logger, mock_sessionmaker, mock_get_engine):
        """Test successful session factory creation."""
        # Setup
        mock_engine = MagicMock(spec=Engine)
        mock_get_engine.return_value = mock_engine

        mock_factory = MagicMock()
        mock_sessionmaker.return_value = mock_factory

        # Execute
        result = get_session_factory()

        # Verify
        assert result is mock_factory
        mock_sessionmaker.assert_called_once_with(autocommit=False, autoflush=False, bind=mock_engine)
        mock_logger.info.assert_called_once_with("DATABASE: Creating session factory")

    @patch("app.core.database.get_engine")
    @patch("app.core.database.logger")
    def test_get_session_factory_no_engine(self, mock_logger, mock_get_engine):
        """Test session factory creation when engine is None."""
        # Setup
        get_session_factory.cache_clear()  # Clear cache to ensure fresh test
        mock_get_engine.return_value = None

        # Execute
        result = get_session_factory()

        # Verify
        assert result is None
        mock_logger.error.assert_called_once_with("DATABASE: Cannot create session factory - engine is None")

    @patch("app.core.database.get_engine")
    @patch("app.core.database.sessionmaker")
    @patch("app.core.database.logger")
    def test_get_session_factory_sqlalchemy_error(self, mock_logger, mock_sessionmaker, mock_get_engine):
        """Test session factory creation with SQLAlchemy error."""
        # Setup
        get_session_factory.cache_clear()  # Clear cache to ensure fresh test
        mock_engine = MagicMock(spec=Engine)
        mock_get_engine.return_value = mock_engine

        mock_sessionmaker.side_effect = SQLAlchemyError("Session factory error")

        # Execute
        result = get_session_factory()

        # Verify
        assert result is None
        assert mock_logger.error.call_count == 1
        # Check that error logging was called with the right message
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Failed to create session factory" in str(calls[0])

    @patch("app.core.database.get_engine")
    @patch("app.core.database.sessionmaker")
    @patch("app.core.database.logger")
    def test_get_session_factory_connection_error(self, mock_logger, mock_sessionmaker, mock_get_engine):
        """Test session factory creation with connection error."""
        # Setup
        get_session_factory.cache_clear()  # Clear cache to ensure fresh test
        mock_engine = MagicMock(spec=Engine)
        mock_get_engine.return_value = mock_engine

        mock_sessionmaker.side_effect = ConnectionError("Connection error")

        # Execute
        result = get_session_factory()

        # Verify
        assert result is None
        assert mock_logger.error.call_count == 1
        # Check that error logging was called with the right message
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Failed to create session factory" in str(calls[0])

    def test_get_session_factory_caching(self):
        """Test that get_session_factory returns cached instance."""
        with patch("app.core.database.get_engine") as mock_get_engine:
            mock_engine = MagicMock(spec=Engine)
            mock_get_engine.return_value = mock_engine

            with patch("app.core.database.sessionmaker") as mock_sessionmaker:
                mock_factory = MagicMock()
                mock_sessionmaker.return_value = mock_factory

                # Clear cache and get factory twice
                get_session_factory.cache_clear()
                factory1 = get_session_factory()
                factory2 = get_session_factory()

                # Should be the same instance due to caching
                assert factory1 is factory2
                # sessionmaker should only be called once
                assert mock_sessionmaker.call_count == 1


class TestGetDb:
    """Test the get_db function."""

    @patch("app.core.database.get_session_factory")
    @patch("app.core.database.logger")
    def test_get_db_success(self, mock_logger, mock_get_session_factory):
        """Test successful database session creation."""
        # Setup
        mock_factory = MagicMock()
        mock_session = MagicMock()
        mock_factory.return_value = mock_session
        mock_get_session_factory.return_value = mock_factory

        # Execute
        db_gen = get_db()
        db = next(db_gen)

        # Verify
        assert db is mock_session
        mock_factory.assert_called_once()
        mock_logger.debug.assert_called_once_with("DATABASE: Database session created successfully")

        # Test cleanup
        try:
            next(db_gen)
        except StopIteration:
            pass

        mock_session.close.assert_called_once()
        mock_logger.debug.assert_has_calls(
            [
                call("DATABASE: Database session created successfully"),
                call("DATABASE: Database session closed successfully"),
            ]
        )

    @patch("app.core.database.get_session_factory")
    @patch("app.core.database.logger")
    def test_get_db_no_factory(self, mock_logger, mock_get_session_factory):
        """Test database session creation when factory is None."""
        # Setup
        mock_get_session_factory.return_value = None

        # Execute
        db_gen = get_db()
        db = next(db_gen)

        # Verify
        assert db is None
        mock_logger.error.assert_called_once_with("DATABASE: Cannot create database session - session factory is None")

        # Test cleanup
        try:
            next(db_gen)
        except StopIteration:
            pass

    @patch("app.core.database.get_session_factory")
    @patch("app.core.database.logger")
    def test_get_db_session_creation_error(self, mock_logger, mock_get_session_factory):
        """Test database session creation with error during session creation."""
        # Setup
        mock_factory = MagicMock()
        mock_factory.side_effect = SQLAlchemyError("Session creation failed")
        mock_get_session_factory.return_value = mock_factory

        # Execute
        db_gen = get_db()
        db = next(db_gen)

        # Verify
        assert db is None
        assert mock_logger.error.call_count == 1
        # Check that error logging was called with the right message
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Unexpected error in database session" in str(calls[0])

        # Test cleanup
        try:
            next(db_gen)
        except StopIteration:
            pass

    @patch("app.core.database.get_session_factory")
    @patch("app.core.database.logger")
    def test_get_db_session_error_with_rollback(self, mock_logger, mock_get_session_factory):
        """Test database session with error and rollback."""
        # Setup
        mock_factory = MagicMock()
        mock_session = MagicMock()
        mock_factory.return_value = mock_session
        mock_get_session_factory.return_value = mock_factory

        # Execute
        db_gen = get_db()
        db = next(db_gen)

        # Verify session was created
        assert db is mock_session

        # Test cleanup - the session should be closed
        try:
            next(db_gen)
        except StopIteration:
            pass

        mock_session.close.assert_called_once()

    @patch("app.core.database.get_session_factory")
    @patch("app.core.database.logger")
    def test_get_db_close_error(self, mock_logger, mock_get_session_factory):
        """Test database session with error during close."""
        # Setup
        mock_factory = MagicMock()
        mock_session = MagicMock()
        mock_session.close.side_effect = SQLAlchemyError("Close error")
        mock_factory.return_value = mock_session
        mock_get_session_factory.return_value = mock_factory

        # Execute
        db_gen = get_db()
        db = next(db_gen)

        # Verify session was created
        assert db is mock_session

        # Test cleanup with close error
        try:
            next(db_gen)
        except StopIteration:
            pass

        mock_session.close.assert_called_once()
        assert mock_logger.error.call_count == 1
        # Check that error logging was called with the right message
        calls = mock_logger.error.call_args_list
        assert "DATABASE: Error closing database session" in str(calls[0])


class TestBase:
    """Test the Base declarative base."""

    def test_base_is_declarative_base(self):
        """Test that Base is a proper declarative base."""
        assert Base is not None
        assert hasattr(Base, "registry")
        assert hasattr(Base, "metadata")
