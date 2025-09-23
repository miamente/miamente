import { Page, expect } from "@playwright/test";

export class AdminHelpers {
  constructor(private page: Page) {}

  async loginAsAdmin() {
    await this.page.goto("/login");
    await this.page.waitForLoadState("domcontentloaded");

    // Fill login form with admin credentials
    const testPassword = process.env.E2E_TEST_PASSWORD || "TestPassword123!";
    await this.page.fill('input[name="email"]', "admin@miamente.com");
    await this.page.fill('input[name="password"]', testPassword);

    // Submit form
    await this.page.click('button[type="submit"]');

    // Wait for redirect
    await this.page.waitForURL(/\/admin/, { timeout: 10000 });
  }

  async navigateToAdminSection(section: string) {
    const sectionMap: Record<string, string> = {
      users: "/admin/users",
      professionals: "/admin/professionals",
      "admin-users": "/admin/admin-users",
    };

    const url = sectionMap[section] || `/admin/${section}`;
    await this.page.goto(url);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async checkAdminNavigation() {
    // Check for admin navigation elements
    const navItems = ["Gestionar Usuarios", "Gestionar Profesionales", "Usuarios Administrativos"];

    for (const item of navItems) {
      await expect(this.page.locator(`text=${item}`)).toBeVisible();
    }
  }

  async checkAdminHeader() {
    // Check for admin header elements
    await expect(this.page.locator("text=Panel de Administración")).toBeVisible();
  }
}
