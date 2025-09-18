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
    private readonly page: Page,
    private readonly request: APIRequestContext,
  ) {}

  /**
   * Login as a regular user
   */
  async loginAsUser(credentials: LoginCredentials): Promise<void> {
    await this.page.goto("/login");

    // Wait for form to be ready
    await this.page.waitForSelector('input[name="email"]');
    await this.page.waitForSelector('input[name="password"]');

    // Robust form filling to avoid validation errors
    await this.page.focus('input[name="email"]');
    await this.page.fill('input[name="email"]', "");
    await this.page.type('input[name="email"]', credentials.email, { delay: 50 });

    await this.page.focus('input[name="password"]');
    await this.page.fill('input[name="password"]', "");
    await this.page.type('input[name="password"]', credentials.password, { delay: 50 });

    // Wait for validation to complete
    await this.page.waitForTimeout(300);

    // Click login button
    await this.page.click('button[type="submit"]');

    // Wait for either redirect or error message
    try {
      await this.page.waitForURL(/\/(dashboard|verify)/, { timeout: 10000 });

      // If redirected to verify page, that's expected for unverified users
      if (this.page.url().includes("/verify")) {
        console.log("User redirected to verify page (expected for unverified users)");
        return;
      }

      // If redirected to dashboard, wait for it to finish loading
      if (this.page.url().includes("/dashboard")) {
        await this.page.waitForFunction(
          () => {
            const loadingSpinner = document.querySelector(".animate-spin");
            return !loadingSpinner || (loadingSpinner as HTMLElement).offsetParent === null;
          },
          { timeout: 10000 },
        );
      }
    } catch {
      // Check if we're still on login page with an error
      const currentUrl = this.page.url();
      if (currentUrl.includes("/login")) {
        // Check for error messages
        const errorMessage = this.page.locator(
          '[class*="error"], [class*="red"], [data-testid="error"]',
        );
        const errorCount = await errorMessage.count();

        if (errorCount > 0) {
          const errorText = await errorMessage.first().textContent();
          throw new Error(`User login failed: ${errorText}`);
        } else {
          throw new Error("User login failed: No redirect occurred and no error message found");
        }
      } else {
        throw new Error("Unexpected navigation state after user login");
      }
    }
  }

  /**
   * Login as a professional
   */
  async loginAsProfessional(credentials: LoginCredentials): Promise<void> {
    await this.page.goto("/login");

    // Wait for form to be ready
    await this.page.waitForSelector('input[name="email"]');
    await this.page.waitForSelector('input[name="password"]');

    // Robust form filling to avoid validation errors
    await this.page.focus('input[name="email"]');
    await this.page.fill('input[name="email"]', "");
    await this.page.type('input[name="email"]', credentials.email, { delay: 50 });

    await this.page.focus('input[name="password"]');
    await this.page.fill('input[name="password"]', "");
    await this.page.type('input[name="password"]', credentials.password, { delay: 50 });

    // Wait for validation to complete
    await this.page.waitForTimeout(300);

    // Click login button
    await this.page.click('button[type="submit"]');

    // Wait for either redirect or error message
    try {
      await this.page.waitForURL(/\/(dashboard|verify)/, { timeout: 10000 });

      // If redirected to verify page, that's expected for unverified users
      if (this.page.url().includes("/verify")) {
        console.log(
          "Professional redirected to verify page (expected for unverified professionals)",
        );
        return;
      }

      // Wait for dashboard to finish loading (not just the loading spinner)
      await this.page.waitForFunction(
        () => {
          const loadingSpinner = document.querySelector(".animate-spin");
          return !loadingSpinner || (loadingSpinner as HTMLElement).offsetParent === null;
        },
        { timeout: 10000 },
      );
    } catch {
      // Check if we're still on login page with an error
      const currentUrl = this.page.url();
      if (currentUrl.includes("/login")) {
        // Check for error messages
        const errorMessage = this.page.locator(
          '[class*="error"], [class*="red"], [data-testid="error"]',
        );
        const errorCount = await errorMessage.count();

        if (errorCount > 0) {
          const errorText = await errorMessage.first().textContent();
          throw new Error(`Professional login failed: ${errorText}`);
        } else {
          throw new Error(
            "Professional login failed: No redirect occurred and no error message found",
          );
        }
      } else {
        throw new Error("Unexpected navigation state after professional login");
      }
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Look for logout button/link with multiple possible text variations
    const logoutButton = this.page
      .locator('button:has-text("Cerrar sesión")')
      .or(this.page.locator('button:has-text("Cerrar Sesión")'))
      .or(this.page.locator('button:has-text("Logout")'))
      .or(this.page.locator('a:has-text("Cerrar sesión")'))
      .or(this.page.locator('a:has-text("Cerrar Sesión")'))
      .or(this.page.locator('[data-testid="logout-button"]'));

    // Wait a bit for the page to fully load
    await this.page.waitForTimeout(1000);

    if (await logoutButton.isVisible()) {
      console.log("Logout button found, clicking...");
      await logoutButton.click();

      // Wait for navigation to complete
      await this.page.waitForLoadState("networkidle");
    } else {
      console.log("No logout button found, trying to clear auth manually");
      // If no logout button found, try to clear auth manually
      await this.clearAuth();
    }

    // Wait for redirect to login or landing page
    try {
      await this.page.waitForURL(/\/(login|landing)/, { timeout: 10000 });
    } catch {
      // If still not redirected, try navigating to login manually
      console.log("Not redirected automatically, navigating to login manually");
      await this.page.goto("/login");
    }
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
    try {
      await this.page.waitForLoadState("domcontentloaded");

      return await this.page.evaluate(() => {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            return localStorage.getItem("access_token");
          }
        } catch {
          // Ignore localStorage errors
        }
        return null;
      });
    } catch {
      // localStorage access not available in test environment
      return null;
    }
  }

  /**
   * Set authentication token in localStorage
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await this.page.waitForLoadState("domcontentloaded");

      await this.page.evaluate((token) => {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem("access_token", token);
          }
        } catch {
          // Ignore localStorage errors
        }
      }, token);
    } catch {
      // localStorage access not available in test environment
    }
  }

  /**
   * Clear authentication data
   */
  async clearAuth(): Promise<void> {
    try {
      // Wait for page to be ready
      await this.page.waitForLoadState("domcontentloaded");

      await this.page.evaluate(() => {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
          }
        } catch {
          // Ignore localStorage errors
        }
      });
    } catch {
      // Ignore localStorage access errors in test environment
      // This is expected in some test environments
    }
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
    const response = await this.request.post("/api/v1/auth/register/professional", {
      data: professionalData,
    });

    if (!response.ok()) {
      throw new Error(`Professional registration failed: ${response.status()}`);
    }
  }
}
