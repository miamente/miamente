# Backend Tests

This directory contains comprehensive tests for the FastAPI backend.

## Test Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── unit/                    # Unit tests
│   ├── test_models.py      # Database model tests (8 tests)
│   ├── test_services.py    # Service layer tests (15 tests)
│   ├── test_user_service.py        # Test service for users
│   ├── test_professional_service.py # Test service for professionals
│   ├── test_appointment_service.py  # Test service for appointments
│   └── test_auth_service.py         # Test service for authentication
├── integration/             # Integration tests
│   ├── test_auth_endpoints.py      # Authentication API tests
│   ├── test_user_endpoints.py      # User API tests
│   ├── test_professional_endpoints.py  # Professional API tests
│   ├── test_appointment_endpoints.py   # Appointment API tests
│   └── test_payment_endpoints.py       # Payment API tests
└── fixtures/                # Test fixtures and utilities
    └── test_appointment.py  # Test schemas for appointments
```

## Running Tests

### Prerequisites

Make sure you have all dependencies installed:

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
# From the backend directory
python run_tests.py
```

### Run Specific Test Types

```bash
# Unit tests only
pytest tests/unit/ -v

# Integration tests only
pytest tests/integration/ -v

# Tests with coverage
pytest tests/ -v --cov=app --cov-report=term-missing

# Generate HTML coverage report
pytest tests/ -v --cov=app --cov-report=html
```

### Run Individual Test Files

```bash
# Test models
pytest tests/unit/test_models.py -v

# Test services
pytest tests/unit/test_services.py -v

# Test authentication endpoints
pytest tests/integration/test_auth_endpoints.py -v
```

### Run Specific Tests

```bash
# Run a specific test function
pytest tests/unit/test_models.py::TestUserModel::test_create_user -v

# Run tests matching a pattern
pytest tests/ -k "test_create" -v
```

## Test Categories

### Unit Tests (`tests/unit/`)

- **Model Tests**: Test database models, relationships, and constraints
- **Service Tests**: Test business logic in service classes

### Integration Tests (`tests/integration/`)

- **API Endpoint Tests**: Test HTTP endpoints, request/response handling
- **Authentication Tests**: Test login, registration, and token handling
- **Database Integration**: Test database operations through the API

## Test Fixtures

The `conftest.py` file provides several useful fixtures:

- `db_session`: Fresh database session for each test
- `client`: FastAPI test client with database override
- `test_user_data`: Sample user data for testing
- `test_professional_data`: Sample professional data for testing
- `test_appointment_data`: Sample appointment data for testing

## Test Database

Tests use a SQLite in-memory database (`test.db`) that is created and destroyed for each test run. This ensures:

- Tests are isolated from each other
- No interference with development/production data
- Fast test execution

## Coverage

The test suite includes coverage reporting to ensure comprehensive testing:

- **Terminal Coverage**: Shows coverage percentage in terminal
- **HTML Coverage**: Generates detailed HTML report in `htmlcov/` directory
- **XML Coverage**: Generates XML report for CI/CD integration

## Writing New Tests

### Unit Test Example

```python
def test_create_user(self, db_session):
    """Test creating a user."""
    service = UserService(db_session)
    user_data = UserCreate(
        email="test@example.com",
        password="testpassword123",
        full_name="Test User"
    )

    user = service.create_user(user_data)

    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    assert user.hashed_password != "testpassword123"
```

### Integration Test Example

```python
def test_register_user(self, client: TestClient):
    """Test user registration."""
    user_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }

    response = client.post("/api/v1/auth/register/user", json=user_data)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "password" not in data
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Naming**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
4. **Mock External Dependencies**: Use mocks for external services, email, etc.
5. **Test Edge Cases**: Include tests for error conditions and edge cases
6. **Keep Tests Fast**: Use in-memory database and avoid slow operations

## Continuous Integration

The test suite is designed to run in CI/CD environments:

- Uses SQLite for fast, isolated testing
- Includes coverage reporting
- Provides clear pass/fail status
- Generates reports for analysis

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure you're running tests from the backend directory
2. **Database Errors**: Ensure test database is properly configured
3. **Authentication Errors**: Check that test tokens are properly generated
4. **Fixture Errors**: Verify that fixtures are properly defined in conftest.py

### Debug Mode

Run tests with verbose output for debugging:

```bash
pytest tests/ -v -s --tb=long
```

The `-s` flag shows print statements, and `--tb=long` shows full tracebacks.
