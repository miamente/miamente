import { test, expect } from "@playwright/test";

import { AuthPage } from "./page-objects/auth-page";
import { TEST_USERS, generateTestEmail, mockEmailVerification } from "./utils/test-data-seeder";

test.describe("User Registration and Email Verification @e2e", () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test("should complete user registration flow", async ({ page }) => {
    const testEmail = generateTestEmail("user");

    // Navigate to registration page
    await authPage.gotoRegister();

    // Verify registration page loads
    await expect(page.locator("h1")).toContainText("Crear Cuenta");

    // Fill registration form
    await authPage.fillRegistrationForm({
      email: testEmail,
      password: TEST_USERS.user.password,
    });

    // Submit registration
    await authPage.submitRegistration();

    // Verify success message
    await authPage.expectRegistrationSuccess();

    // Verify user is redirected or shown success state
    await expect(page.locator("text=Verifica tu email")).toBeVisible();
  });

  test("should handle registration validation errors", async () => {
    await authPage.gotoRegister();

    // Try to submit empty form
    await authPage.submitRegistration();

    // Verify validation errors
    await authPage.expectValidationError("email");
    await authPage.expectValidationError("password");

    // Try invalid email
    await authPage.fillRegistrationForm({
      email: "invalid-email",
      password: "123", // Too short
    });
    await authPage.submitRegistration();

    // Verify specific validation errors
    await authPage.expectError("Email inválido");
    await authPage.expectError("La contraseña debe tener al menos 6 caracteres");
  });

  test("should require consent checkbox", async () => {
    await authPage.gotoRegister();

    // Fill form but don't check consent
    await authPage.fillRegistrationForm({
      email: generateTestEmail("user"),
      password: TEST_USERS.user.password,
    });

    // Uncheck consent (it should be checked by fillRegistrationForm)
    await authPage.consentCheckbox.uncheck();

    // Submit registration
    await authPage.submitRegistration();

    // Verify consent error
    await authPage.expectError("Debes aceptar los términos y condiciones");
  });

  test("should handle email verification flow", async ({ page }) => {
    const testEmail = generateTestEmail("user");

    // Complete registration
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: testEmail,
      password: TEST_USERS.user.password,
    });
    await authPage.submitRegistration();

    // Mock email verification
    await mockEmailVerification(page, testEmail);

    // Verify user can proceed to login or dashboard
    await expect(page.locator("text=Email verificado")).toBeVisible();

    // Try to login with verified account
    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: testEmail,
      password: TEST_USERS.user.password,
    });
    await authPage.submitLogin();

    // Should be able to login successfully
    await authPage.expectLoginSuccess();
  });

  test("should prevent duplicate email registration", async () => {
    const testEmail = generateTestEmail("duplicate");

    // First registration
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: testEmail,
      password: TEST_USERS.user.password,
    });
    await authPage.submitRegistration();
    await authPage.expectRegistrationSuccess();

    // Try to register again with same email
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: testEmail,
      password: TEST_USERS.user.password,
    });
    await authPage.submitRegistration();

    // Should show error about existing email
    await authPage.expectError("Ya existe una cuenta con este email");
  });

  test("should handle professional registration", async () => {
    const testEmail = generateTestEmail("professional");

    // Navigate to registration
    await authPage.gotoRegister();

    // Fill professional registration form
    await authPage.fillRegistrationForm({
      email: testEmail,
      password: TEST_USERS.professional.password,
    });

    // Submit registration
    await authPage.submitRegistration();

    // Verify success
    await authPage.expectRegistrationSuccess();

    // Mock email verification
    await mockEmailVerification(page, testEmail);

    // Verify professional can login
    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: testEmail,
      password: TEST_USERS.professional.password,
    });
    await authPage.submitLogin();

    // Should redirect to professional dashboard
    await expect(page).toHaveURL(/\/dashboard\/pro/);
  });

  test("should handle admin registration", async () => {
    const testEmail = generateTestEmail("admin");

    // Navigate to registration
    await authPage.gotoRegister();

    // Fill admin registration form
    await authPage.fillRegistrationForm({
      email: testEmail,
      password: TEST_USERS.admin.password,
    });

    // Submit registration
    await authPage.submitRegistration();

    // Verify success
    await authPage.expectRegistrationSuccess();

    // Mock email verification
    await mockEmailVerification(page, testEmail);

    // Verify admin can login
    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: testEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
  });
});
