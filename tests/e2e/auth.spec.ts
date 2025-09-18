import { test, expect } from "@playwright/test";

import { AuthHelper } from "./utils/auth-helper";
import { TestHelpers } from "./utils/test-helpers";

test.describe("Authentication Flow", () => {
  let authHelper: AuthHelper;
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page, request);
    testHelpers = new TestHelpers(page);

    // Clear any existing auth data
    await authHelper.clearAuth();
  });

  test.describe("User Registration and Login", () => {
    test("should register a new user successfully", async ({ page }) => {
      await page.goto("/register");

      // Fill registration form
      await testHelpers.fillField('input[name="email"]', "newuser@example.com");
      await testHelpers.fillField('input[name="password"]', "TestPassword123!");
      await testHelpers.fillField('input[name="confirmPassword"]', "TestPassword123!");
      await testHelpers.fillField('input[name="full_name"]', "New Test User");
      await testHelpers.fillField('input[name="phone"]', "+1234567899");

      // Submit form
      await testHelpers.clickElement('button[type="submit"]');

      // Should redirect to login or dashboard
      await testHelpers.waitForNavigation();

      // Check for success message or redirect
      const successMessage = page
        .locator("text=Registro exitoso")
        .or(page.locator("text=Account created successfully"));

      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      } else {
        // If redirected to dashboard, user was auto-logged in
        await expect(page).toHaveURL(/.*\/dashboard/);
      }
    });

    test("should login with valid credentials", async ({ page }) => {
      const credentials = {
        email: "testuser1@example.com",
        password: "TestPassword123!",
      };

      await authHelper.loginAsUser(credentials);

      // Should be redirected to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);

      // Check if user info is visible
      const userInfo = page
        .locator('[data-testid="user-menu"]')
        .or(page.locator("text=Test User 1"));

      await expect(userInfo).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      // Fill with invalid credentials
      await testHelpers.fillField('input[name="email"]', "invalid@example.com");
      await testHelpers.fillField('input[name="password"]', "wrongpassword");

      // Submit form
      await testHelpers.clickElement('button[type="submit"]');

      // Should show error message
      const errorMessage = page
        .locator("text=Credenciales inválidas")
        .or(page.locator("text=Invalid credentials"))
        .or(page.locator('[data-testid="error-message"]'));

      await expect(errorMessage).toBeVisible();
    });

    test("should logout successfully", async ({ page }) => {
      // First login
      const credentials = {
        email: "testuser1@example.com",
        password: "TestPassword123!",
      };

      await authHelper.loginAsUser(credentials);

      // Then logout
      await authHelper.logout();

      // Should be redirected to login or landing page
      await expect(page).toHaveURL(/.*\/(login|landing)/);
    });
  });

  test.describe("Professional Registration and Login", () => {
    test("should register a new professional successfully", async ({ page }) => {
      await page.goto("/register-professional");

      // Fill professional registration form
      await testHelpers.fillField('input[name="email"]', "newprofessional@example.com");
      await testHelpers.fillField('input[name="password"]', "TestPassword123!");
      await testHelpers.fillField('input[name="confirmPassword"]', "TestPassword123!");
      await testHelpers.fillField('input[name="full_name"]', "Dr. New Professional");
      await testHelpers.fillField('input[name="phone"]', "+1234567898");
      await testHelpers.fillField('input[name="license_number"]', "PSY999999");
      await testHelpers.fillField('textarea[name="bio"]', "Experienced mental health professional");

      // Submit form
      await testHelpers.clickElement('button[type="submit"]');

      // Should redirect to login or dashboard
      await testHelpers.waitForNavigation();

      // Check for success message or redirect
      const successMessage = page
        .locator("text=Registro exitoso")
        .or(page.locator("text=Professional registered successfully"));

      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      } else {
        // If redirected to dashboard, professional was auto-logged in
        await expect(page).toHaveURL(/.*\/dashboard/);
      }
    });

    test("should login as professional successfully", async ({ page }) => {
      const credentials = {
        email: "dr.smith@example.com",
        password: "TestPassword123!",
      };

      await authHelper.loginAsProfessional(credentials);

      // Should be redirected to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);

      // Check if professional info is visible
      const professionalInfo = page
        .locator('[data-testid="professional-menu"]')
        .or(page.locator("text=Dr. Sarah Smith"));

      await expect(professionalInfo).toBeVisible();
    });
  });

  test.describe("Form Validation", () => {
    test("should validate required fields in user registration", async ({ page }) => {
      await page.goto("/register");

      // Try to submit empty form
      await testHelpers.clickElement('button[type="submit"]');

      // Should show validation errors
      const emailError = page
        .locator("text=Email es requerido")
        .or(page.locator("text=Email is required"));
      const passwordError = page
        .locator("text=Contraseña es requerida")
        .or(page.locator("text=Password is required"));

      await expect(emailError).toBeVisible();
      await expect(passwordError).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/register");

      // Fill with invalid email
      await testHelpers.fillField('input[name="email"]', "invalid-email");
      await testHelpers.fillField('input[name="password"]', "TestPassword123!");
      await testHelpers.fillField('input[name="confirmPassword"]', "TestPassword123!");
      await testHelpers.fillField('input[name="full_name"]', "Test User");
      await testHelpers.fillField('input[name="phone"]', "+1234567899");

      // Submit form
      await testHelpers.clickElement('button[type="submit"]');

      // Should show email validation error
      const emailError = page
        .locator("text=Email inválido")
        .or(page.locator("text=Invalid email format"));

      await expect(emailError).toBeVisible();
    });

    test("should validate password confirmation", async ({ page }) => {
      await page.goto("/register");

      // Fill with mismatched passwords
      await testHelpers.fillField('input[name="email"]', "test@example.com");
      await testHelpers.fillField('input[name="password"]', "TestPassword123!");
      await testHelpers.fillField('input[name="confirmPassword"]', "DifferentPassword123!");
      await testHelpers.fillField('input[name="full_name"]', "Test User");
      await testHelpers.fillField('input[name="phone"]', "+1234567899");

      // Submit form
      await testHelpers.clickElement('button[type="submit"]');

      // Should show password confirmation error
      const passwordError = page
        .locator("text=Las contraseñas no coinciden")
        .or(page.locator("text=Passwords do not match"));

      await expect(passwordError).toBeVisible();
    });
  });

  test.describe("Password Requirements", () => {
    test("should enforce password strength requirements", async ({ page }) => {
      await page.goto("/register");

      // Fill with weak password
      await testHelpers.fillField('input[name="email"]', "test@example.com");
      await testHelpers.fillField('input[name="password"]', "weak");
      await testHelpers.fillField('input[name="confirmPassword"]', "weak");
      await testHelpers.fillField('input[name="full_name"]', "Test User");
      await testHelpers.fillField('input[name="phone"]', "+1234567899");

      // Submit form
      await testHelpers.clickElement('button[type="submit"]');

      // Should show password strength error
      const passwordError = page
        .locator("text=La contraseña debe tener al menos")
        .or(page.locator("text=Password must be at least"))
        .or(page.locator("text=Password too weak"));

      await expect(passwordError).toBeVisible();
    });
  });
});
