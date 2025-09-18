"""
Root pytest configuration for UNIT tests only. Prevents DB connections by default.
Integration tests have their own Postgres-backed setup in tests/integration/conftest.py.
"""
import pytest
from unittest.mock import MagicMock


@pytest.fixture(scope="function")
def db_session() -> MagicMock:
    """Provide a mocked SQLAlchemy Session for unit tests."""
    session = MagicMock(name="Session")
    # Common patterns used in services: query().filter().first()/all()
    session.query.return_value = session
    session.filter.return_value = session
    session.offset.return_value = session
    session.limit.return_value = session
    session.first.return_value = None
    session.all.return_value = []
    return session


@pytest.fixture
def test_user_data():
    return {
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
    }


@pytest.fixture
def test_professional_data():
    return {
        "full_name": "Test Professional",
        "email": "professional@example.com",
        "password": "testpassword123",
        "rate_cents": 50000,
        "currency": "COP",
    }
