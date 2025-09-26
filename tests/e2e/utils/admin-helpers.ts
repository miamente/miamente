import { Page, expect } from "@playwright/test";

export class AdminHelpers {
  constructor(private page: Page) {}

  async loginAsAdmin() {
    // Go to admin login page specifically
    await this.page.goto("/admin/login");
    await this.page.waitForLoadState("domcontentloaded");

    // Wait for form to be visible
    await this.page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await this.page.waitForSelector('input[name="password"]', { timeout: 10000 });

    // Fill login form with admin credentials
    const testPassword = process.env.E2E_TEST_PASSWORD || "TestPassword123!";
    await this.page.fill('input[name="email"]', "admin@miamente.com");
    await this.page.fill('input[name="password"]', testPassword);

    // Submit form
    await this.page.click('button[type="submit"]');

    // Wait for redirect - could be to admin dashboard or admin users page
    try {
      await this.page.waitForURL(/\/admin/, { timeout: 20000 });
    } catch (error) {
      // If we're still on login page, check for error messages
      const currentUrl = this.page.url();
      if (currentUrl.includes("/admin/login")) {
        console.log("Still on login page, checking for errors...");
        const errorMessage = await this.page
          .locator('[role="alert"], .error, .text-red-500')
          .textContent();
        if (errorMessage) {
          console.log("Login error:", errorMessage);
        }
        throw new Error(`Admin login failed. Still on login page: ${currentUrl}`);
      }
      throw error;
    }

    // Wait for page to fully load (not just loading state)
    await this.page.waitForLoadState("networkidle", { timeout: 10000 });

    // Verify we're actually logged in by checking for admin elements
    try {
      await this.page.waitForSelector("text=Dashboard de Administración", { timeout: 5000 });
    } catch {
      // If we can't find the admin dashboard, we might be on a different admin page
      console.log("Could not find admin dashboard, checking current URL:", this.page.url());
    }
  }

  async navigateToAdminSection(section: string) {
    const sectionMap: Record<string, string> = {
      users: "/admin/users",
      professionals: "/admin/professionals",
      "admin-users": "/admin/admin-users",
    };

    const url = sectionMap[section] || `/admin/${section}`;

    // Navigate to the section
    await this.page.goto(url);
    await this.page.waitForLoadState("domcontentloaded");

    // Check if we were redirected to login (authentication issue)
    const currentUrl = this.page.url();
    if (currentUrl.includes("/admin/login")) {
      throw new Error(`Authentication failed. Redirected to login when trying to access ${url}`);
    }

    // Wait for the page to fully load
    await this.page.waitForTimeout(1000);

    // Verify we're on the correct page
    if (!currentUrl.includes(url)) {
      console.log(`Expected to be on ${url}, but currently on ${currentUrl}`);
    }
  }

  async checkAdminNavigation() {
    // Check for admin navigation elements
    const navItems = ["Usuarios Regulares", "Usuarios Administrativos", "Profesionales"];

    for (const item of navItems) {
      await expect(this.page.locator(`text=${item}`)).toBeVisible();
    }
  }

  async checkAdminHeader() {
    // Check for admin header elements
    await expect(this.page.locator("text=Dashboard de Administración")).toBeVisible();
  }
}
