# Playwright E2E Tests

This directory contains end-to-end tests for the Miamente platform using Playwright.

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (use `nvm use v22`)
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:3000`

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## 📁 Test Structure

```
tests/e2e/
├── utils/                    # Test utilities and helpers
│   ├── auth-helper.ts       # Authentication utilities
│   ├── data-seeder.ts       # Data seeding for empty tables
│   └── test-helpers.ts      # General test utilities
├── auth.spec.ts             # Authentication flow tests
├── dashboard.spec.ts        # Dashboard functionality tests
├── landing-page.spec.ts     # Landing page tests
├── login.spec.ts           # Login page tests
├── professionals.spec.ts   # Professionals listing tests
├── global-setup.ts         # Global test setup
└── global-teardown.ts      # Global test teardown
```

## 🛠️ Test Utilities

### Data Seeder

The `DataSeeder` class automatically populates empty database tables with test data:

- **Specialties**: Psicología Clínica, Psicoterapia, Psiquiatría, etc.
- **Modalities**: Presencial, Virtual, Híbrida
- **Therapeutic Approaches**: CBT, Psicoanálisis, Terapia Humanista, etc.
- **Test Users**: Regular users and professionals
- **Test Professionals**: Dr. Sarah Smith, Dr. Michael Johnson, etc.

### Auth Helper

The `AuthHelper` class provides utilities for:

- User and professional login/logout
- API-based authentication
- Session management
- Token handling

### Test Helpers

The `TestHelpers` class provides utilities for:

- Page navigation and waiting
- Form filling and clicking
- Screenshot capture
- Responsive testing
- API mocking

## 🎯 Test Strategy

### Data Population

Tests are designed to handle both populated and empty databases:

1. **Global Setup**: Checks if data exists, seeds if necessary
2. **Graceful Degradation**: Tests skip or adapt when data is missing
3. **Realistic Scenarios**: Uses actual API endpoints for data seeding

### Test Categories

#### 1. Authentication Tests (`auth.spec.ts`)

- User registration and login
- Professional registration and login
- Form validation
- Password requirements
- Error handling

#### 2. Professionals Tests (`professionals.spec.ts`)

- Professional listing display
- Filtering and search
- Navigation to profiles
- Responsive design
- Empty state handling

#### 3. Dashboard Tests (`dashboard.spec.ts`)

- User dashboard functionality
- Professional dashboard features
- Navigation and profile management
- Responsive design
- Security and session management

#### 4. Landing Page Tests (`landing-page.spec.ts`)

- Hero section display
- Value propositions
- FAQ functionality
- Navigation and CTAs
- Responsive design

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Timeouts**: 30s test, 10s expect
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

### Environment Variables

```bash
# Test password for e2e tests (used for all test user accounts)
# Default: TestPassword123!
E2E_TEST_PASSWORD=TestPassword123!

# Optional: Override base URL
PLAYWRIGHT_BASE_URL=http://localhost:3000

# CI mode (enables retries, single worker)
CI=true
```

#### Creating a .env file

Create a `.env` file in the `tests/e2e/` directory to customize test settings:

```bash
# Copy the example and modify as needed
cp tests/e2e/.env.example tests/e2e/.env
```

**Note**: The `.env` file is gitignored and will not be committed to version control.

## 📊 Test Data

### Test Users

- **Email**: `testuser1@example.com`
- **Password**: `E2E_TEST_PASSWORD` (default: `TestPassword123!`)
- **Name**: Test User 1

### Test Professionals

- **Email**: `dr.smith@example.com`
- **Password**: `E2E_TEST_PASSWORD` (default: `TestPassword123!`)
- **Name**: Dr. Sarah Smith
- **Specialty**: Psicología Clínica

**Note**: All test passwords use the `E2E_TEST_PASSWORD` environment variable. You can customize this by setting the environment variable or creating a `.env` file in the `tests/e2e/` directory.

## 🐛 Debugging

### Screenshots

Screenshots are automatically captured on test failures and saved to:

```
test-results/screenshots/
```

### Videos

Videos are recorded for failed tests and saved to:

```
test-results/videos/
```

### Traces

Traces are generated for failed tests and can be viewed with:

```bash
npx playwright show-trace test-results/trace.zip
```

### Debug Mode

Run tests in debug mode to step through them:

```bash
npm run test:e2e:debug
```

## 🚨 Common Issues

### 1. Database Empty

**Problem**: Tests fail because database has no data
**Solution**: Data seeder automatically populates data, but ensure backend is running

### 2. Authentication Issues

**Problem**: Login tests fail
**Solution**: Check that test users exist in database, verify API endpoints

### 3. Element Not Found

**Problem**: Tests can't find elements
**Solution**: Tests use flexible selectors and skip gracefully if elements don't exist

### 4. Timeout Issues

**Problem**: Tests timeout waiting for elements
**Solution**: Tests use proper waiting strategies and have reasonable timeouts

## 🔄 CI/CD Integration

Tests are designed to run in CI environments:

- **Headless mode**: Default for CI
- **Retry logic**: 2 retries on CI
- **Single worker**: Prevents resource conflicts
- **Artifact collection**: Screenshots, videos, traces

## 📈 Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Handle empty states gracefully** - tests should work with or without data
3. **Use proper waiting strategies** - avoid hardcoded timeouts
4. **Take screenshots for debugging** - especially for complex interactions
5. **Test responsive design** - verify mobile and desktop layouts
6. **Mock external APIs** when necessary
7. **Clean up test data** appropriately

## 🎨 Test Writing Guidelines

### 1. Test Structure

```typescript
test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test("should do something specific", async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Element Selection

```typescript
// Prefer data-testid
const element = page.locator('[data-testid="element-name"]');

// Fallback to flexible selectors
const element = page
  .locator('button:has-text("Submit")')
  .or(page.locator('[data-testid="submit-button"]'));
```

### 3. Waiting Strategies

```typescript
// Wait for page load
await testHelpers.waitForPageLoad();

// Wait for specific element
await testHelpers.waitForElement('[data-testid="element"]');

// Wait for loading to complete
await testHelpers.waitForLoadingToComplete();
```

### 4. Error Handling

```typescript
// Check if element exists before interacting
if (await testHelpers.elementExists('[data-testid="element"]')) {
  await page.click('[data-testid="element"]');
} else {
  console.log("Element not found, skipping test");
  test.skip();
}
```

## 📝 Adding New Tests

1. Create new test file in `tests/e2e/`
2. Import necessary utilities
3. Follow the test structure guidelines
4. Use data-testid attributes in your components
5. Handle empty states gracefully
6. Add appropriate test descriptions
7. Update this README if needed

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns and conventions
2. Use the provided utilities
3. Test both success and failure scenarios
4. Ensure tests work with empty and populated databases
5. Add appropriate documentation
6. Test on multiple viewport sizes
