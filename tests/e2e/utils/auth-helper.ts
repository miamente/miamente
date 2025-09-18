/**
 * Authentication helper utilities for Playwright tests
 */

import { Page, APIRequestContext } from "@playwright/test";

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthHelper {
  constructor(
    private page: Page,
    private request: APIRequestContext,
  ) {}

  /**
   * Login as a regular user
   */
  async loginAsUser(credentials: LoginCredentials): Promise<void> {
    await this.page.goto("/login");

    // Fill login form
    await this.page.fill('input[name="email"]', credentials.email);
    await this.page.fill('input[name="password"]', credentials.password);

    // Click login button
    await this.page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await this.page.waitForURL(/.*\/dashboard/);
  }

  /**
   * Login as a professional
   */
  async loginAsProfessional(credentials: LoginCredentials): Promise<void> {
    await this.page.goto("/login");

    // Fill login form
    await this.page.fill('input[name="email"]', credentials.email);
    await this.page.fill('input[name="password"]', credentials.password);

    // Click login button
    await this.page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await this.page.waitForURL(/.*\/dashboard/);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Look for logout button/link
    const logoutButton = this.page
      .locator('button:has-text("Cerrar sesión")')
      .or(this.page.locator('button:has-text("Logout")'))
      .or(this.page.locator('[data-testid="logout-button"]'));

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    // Wait for redirect to login or landing page
    await this.page.waitForURL(/.*\/(login|landing)/);
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on a protected page or if user info is visible
      const userMenu = this.page
        .locator('[data-testid="user-menu"]')
        .or(this.page.locator(".user-menu"))
        .or(this.page.locator('button:has-text("Perfil")'));

      return await userMenu.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get authentication token from localStorage
   */
  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem("access_token"));
  }

  /**
   * Set authentication token in localStorage
   */
  async setAuthToken(token: string): Promise<void> {
    await this.page.evaluate((token) => {
      localStorage.setItem("access_token", token);
    }, token);
  }

  /**
   * Clear authentication data
   */
  async clearAuth(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    });
  }

  /**
   * Login via API and set token
   */
  async loginViaAPI(credentials: LoginCredentials): Promise<string> {
    const response = await this.request.post("/api/v1/auth/login", {
      data: credentials,
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()}`);
    }

    const data = await response.json();
    const token = data.access_token;

    // Set token in localStorage
    await this.setAuthToken(token);

    return token;
  }

  /**
   * Register a new user via API
   */
  async registerUserViaAPI(userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }): Promise<void> {
    const response = await this.request.post("/api/v1/auth/register", {
      data: userData,
    });

    if (!response.ok()) {
      throw new Error(`Registration failed: ${response.status()}`);
    }
  }

  /**
   * Register a new professional via API
   */
  async registerProfessionalViaAPI(professionalData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    license_number: string;
    bio: string;
  }): Promise<void> {
    const response = await this.request.post("/api/v1/auth/register-professional", {
      data: professionalData,
    });

    if (!response.ok()) {
      throw new Error(`Professional registration failed: ${response.status()}`);
    }
  }
}
