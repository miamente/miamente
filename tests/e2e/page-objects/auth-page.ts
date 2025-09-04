import { Page, Locator, expect } from "@playwright/test";

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly consentCheckbox: Locator;
  readonly submitButton: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Registration form elements
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    this.consentCheckbox = page.locator('input[type="checkbox"][id="consent"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Login form elements
    this.loginButton = page.locator('button:has-text("Iniciar Sesión")');
    this.registerButton = page.locator('button:has-text("Crear Cuenta")');

    // Messages
    this.errorMessage = page.locator('[role="alert"], .text-red-600, .text-red-400');
    this.successMessage = page.locator(".text-green-600, .text-green-400");
  }

  async gotoRegister(): Promise<void> {
    await this.page.goto("/register");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  async fillRegistrationForm(userData: {
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.confirmPassword || userData.password);
    await this.consentCheckbox.check();
  }

  async fillLoginForm(credentials: { email: string; password: string }): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
  }

  async submitRegistration(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async submitLogin(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectRegistrationSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText("Cuenta creada exitosamente");
  }

  async expectLoginSuccess(): Promise<void> {
    // Should redirect to dashboard or show success message
    await this.page.waitForURL(/\/dashboard|\/profile/, { timeout: 10000 });
  }

  async expectError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectValidationError(field: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="${field}-error"], #${field}-error`);
    await expect(fieldError).toBeVisible();
  }
}
