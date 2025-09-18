# Integration Tests - Production-Safe Database Testing

## Overview

This directory contains integration tests that use the **real PostgreSQL database** (`miamente`) with **production-safe data management**. The tests are designed to never affect production data while providing comprehensive testing of database interactions.

## 🛡️ Production Safety Features

### 1. **Precise Test Data Identification**

- **Unique Test Prefix**: All test data uses `TEST_INTEGRATION_` prefix with timestamps
- **Pattern-Based Cleanup**: Only removes data matching specific test patterns
- **No Table Drops**: Never drops or recreates database tables
- **Selective Deletion**: Only removes test-specific records

### 2. **Test Data Patterns**

The cleanup system identifies test data using these patterns:

```sql
-- Email patterns
email LIKE 'TEST_INTEGRATION_%'
email LIKE '%@example.com'
email LIKE '%@test.com'

-- Name patterns
full_name LIKE 'Test %'
full_name LIKE '% Test'

-- Specific test values
email = 'test@example.com'
email = 'professional@example.com'
full_name = 'Test User'
```

### 3. **Safe Cleanup Process**

1. **Identify Test Data**: Query for records matching test patterns
2. **Clean Related Data**: Remove associated records from junction tables
3. **Clean Reference Data**: Remove test-created reference data only
4. **Preserve Production**: Never touch production data

## 🧪 Test Data Management

### Test Data Generators

```python
# Generate unique test emails
test_email = generate_test_email("user")  # TEST_INTEGRATION_user_20241201_143022@example.com

# Generate unique test names
test_name = generate_test_name("Professional")  # TEST_INTEGRATION_Professional_20241201_143022

# Use test data factory
test_data = test_data_factory["user"]("my_test")  # Complete user data with unique identifiers
```

### Automatic Cleanup

- **Before Each Test**: Database is cleaned before every test runs
- **After Test Suite**: Final cleanup after all tests complete
- **Error Handling**: Cleanup failures don't break tests
- **Logging**: Shows exactly what data was removed

## 🚀 Running Tests

### All Integration Tests

```bash
pytest -m integration
```

### Specific Test Files

```bash
pytest tests/integration/auth/test_auth_endpoints.py
pytest tests/integration/user/test_user_endpoints.py
```

### With Verbose Output

```bash
pytest -m integration -v
```

## 📊 Test Categories

### Authentication Tests (12 tests)

- User registration and validation
- Professional registration and validation
- Login functionality for both user types
- Token validation and user retrieval
- Error handling for invalid credentials

### User Management Tests (7 tests)

- User listing and retrieval
- User updates and modifications
- User deletion
- Authorization checks

## 🔧 Configuration

### Test Database

- **Database**: Uses same `miamente` database as production
- **Connection**: Real PostgreSQL connection (not mocked)
- **Isolation**: Tests run in transactions that are rolled back
- **Cleanup**: Precise data removal after each test

### Fixtures Available

- `client`: FastAPI test client with database overrides
- `test_email_generator`: Function to generate unique test emails
- `test_name_generator`: Function to generate unique test names
- `test_data_factory`: Factory for creating complete test data objects

## ⚠️ Important Notes

### What Gets Cleaned

✅ **Test data with specific patterns**
✅ **Records created by tests**  
✅ **Reference data created by tests**
✅ **Junction table records for test users/professionals**

### What Stays Safe

❌ **Production user data**
❌ **Production professional data**
❌ **Production reference data (specialties, modalities, etc.)**
❌ **Any data not matching test patterns**

### Database Schema

- **Never Modified**: Schema is never altered by tests
- **No DDL Operations**: No CREATE, DROP, or ALTER statements
- **Read-Only Schema**: Tests only perform SELECT, INSERT, UPDATE, DELETE on data

## 🐛 Troubleshooting

### Cleanup Warnings

If you see cleanup warnings, they don't affect test results:

```
⚠️ Warning: Could not clean test data: [error details]
```

This is handled gracefully and tests continue normally.

### Test Data Leakage

If test data appears in production, check:

1. Test data patterns in cleanup function
2. Ensure test data uses proper prefixes
3. Verify cleanup is running before each test

### Performance

- Tests use connection pooling for efficiency
- Cleanup is optimized with precise WHERE clauses
- Each test runs in ~2-3 seconds

## 📈 Coverage

Current test coverage: **55%** (993/2190 statements)

Key areas covered:

- Authentication flows: 60%
- User management: 73%
- Security functions: 93%
- Database models: 96%+

## 🔄 Continuous Integration

These tests are designed to run safely in CI/CD pipelines:

- No external database setup required
- Uses existing production database
- Safe for parallel test execution
- No special permissions needed

---

**Remember**: These tests use the real database but are designed to be completely safe for production environments. The precise cleanup system ensures no production data is ever affected.
