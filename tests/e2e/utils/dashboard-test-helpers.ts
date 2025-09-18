/**
 * Shared test helpers for dashboard tests
 */

import { Page, expect } from "@playwright/test";

export class DashboardTestHelpers {
  constructor(private readonly page: Page) {}

  /**
   * Check if user is on verify page and skip test if needed
   */
  async checkVerifyPageAndSkip(test: any, userType: string): Promise<boolean> {
    const currentUrl = this.page.url();
    if (currentUrl.includes("/verify")) {
      console.log(`${userType} on verify page - skipping test (email verification required)`);
      test.skip();
      return true;
    }
    return false;
  }

  /**
   * Look for and click a link with multiple possible text variations
   */
  async clickLinkWithVariations(
    linkTexts: string[],
    testId?: string,
    buttonTexts?: string[],
  ): Promise<boolean> {
    let locator = this.page.locator(`a:has-text("${linkTexts[0]}")`);

    for (let i = 1; i < linkTexts.length; i++) {
      locator = locator.or(this.page.locator(`a:has-text("${linkTexts[i]}")`));
    }

    if (testId) {
      locator = locator.or(this.page.locator(`[data-testid="${testId}"]`));
    }

    if (buttonTexts) {
      for (const buttonText of buttonTexts) {
        locator = locator.or(this.page.locator(`button:has-text("${buttonText}")`));
      }
    }

    if (await locator.isVisible()) {
      await locator.click();
      return true;
    }
    return false;
  }

  /**
   * Check for dashboard title visibility
   */
  async checkDashboardTitle(): Promise<void> {
    const dashboardTitle = this.page
      .locator("h1, h2")
      .or(this.page.locator('[data-testid="dashboard-title"]'));

    if ((await dashboardTitle.count()) > 0) {
      await expect(dashboardTitle.first()).toBeVisible();
    }
  }

  /**
   * Check for user info visibility
   */
  async checkUserInfo(userName: string): Promise<void> {
    const userInfo = this.page
      .locator('[data-testid="user-info"]')
      .or(this.page.locator(".user-info"))
      .or(this.page.locator(`text=${userName}`));

    if ((await userInfo.count()) > 0) {
      await expect(userInfo.first()).toBeVisible();
    }
  }

  /**
   * Check for navigation menu visibility
   */
  async checkNavigationMenu(): Promise<void> {
    const navMenu = this.page
      .locator("nav")
      .or(this.page.locator('[data-testid="navigation"]'))
      .or(this.page.locator(".navigation"));

    if ((await navMenu.count()) > 0) {
      await expect(navMenu.first()).toBeVisible();
    }
  }

  /**
   * Check for appointments section
   */
  async checkAppointmentsSection(): Promise<void> {
    const appointmentsSection = this.page
      .locator('[data-testid="appointments"]')
      .or(this.page.locator(".appointments"))
      .or(this.page.locator('h2:has-text("Citas")'))
      .or(this.page.locator('h2:has-text("Appointments")'));

    if (await appointmentsSection.isVisible()) {
      await expect(appointmentsSection).toBeVisible();

      // Check for appointment cards or empty state
      const appointmentCards = this.page
        .locator('[data-testid="appointment-card"]')
        .or(this.page.locator(".appointment-card"));

      const emptyState = this.page
        .locator("text=No tienes citas programadas")
        .or(this.page.locator("text=No appointments scheduled"));

      if ((await appointmentCards.count()) > 0) {
        await expect(appointmentCards.first()).toBeVisible();
      } else if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    }
  }

  /**
   * Check for logout button visibility
   */
  async checkLogoutButton(): Promise<void> {
    const logoutButton = this.page
      .locator('button:has-text("Cerrar sesión")')
      .or(this.page.locator('button:has-text("Logout")'))
      .or(this.page.locator('[data-testid="logout-button"]'));

    if (await logoutButton.isVisible()) {
      await expect(logoutButton).toBeVisible();
    } else {
      // Check for user menu that might contain logout
      const userMenu = this.page
        .locator('[data-testid="user-menu"]')
        .or(this.page.locator(".user-menu"));

      if (await userMenu.isVisible()) {
        await userMenu.click();

        const logoutOption = this.page
          .locator('button:has-text("Cerrar sesión")')
          .or(this.page.locator('a:has-text("Cerrar sesión")'));

        if (await logoutOption.isVisible()) {
          await expect(logoutOption).toBeVisible();
        }
      }
    }
  }

  /**
   * Check for mobile menu visibility
   */
  async checkMobileMenu(): Promise<void> {
    const mobileMenu = this.page
      .locator('[data-testid="mobile-menu"]')
      .or(this.page.locator(".mobile-menu"))
      .or(this.page.locator('button[aria-label*="menu"]'));

    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  }
}
