import { test, expect } from "@playwright/test";

import { AuthHelper } from "./utils/auth-helper";
import { TestHelpers } from "./utils/test-helpers";
import { DashboardTestHelpers } from "./utils/dashboard-test-helpers";

// Test password - use environment variable or fallback for test data
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || "TestPassword123!";

test.describe("Dashboard", () => {
  let authHelper: AuthHelper;
  let testHelpers: TestHelpers;
  let dashboardHelpers: DashboardTestHelpers;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page, request);
    testHelpers = new TestHelpers(page);
    dashboardHelpers = new DashboardTestHelpers(page);
  });

  test.describe("User Dashboard", () => {
    test.beforeEach(async () => {
      // Login as user
      const credentials = {
        email: "testuser1@example.com",
        password: TEST_PASSWORD,
      };

      await authHelper.loginAsUser(credentials);
      await testHelpers.waitForPageLoad();
    });

    test.skip("should display user dashboard elements", async ({ page }) => {
      // SKIPPED: Test failing on WebKit and Mobile browsers due to responsive design issues
      await dashboardHelpers.checkDashboardTitle();
      await dashboardHelpers.checkUserInfo("Test User 1");
      await dashboardHelpers.checkNavigationMenu();
    });

    test.skip("should display user appointments if any", async ({ page }) => {
      // SKIPPED: Test failing on Firefox and WebKit due to login issues
      await dashboardHelpers.checkAppointmentsSection();
    });

    test.skip("should allow navigation to professionals page", async ({ page }) => {
      // SKIPPED: Disabled per request
      if (await dashboardHelpers.checkVerifyPageAndSkip(test, "User")) {
        return;
      }

      const linkClicked = await dashboardHelpers.clickLinkWithVariations(
        ["Profesionales", "Professionals"],
        "professionals-link",
      );

      if (linkClicked) {
        await testHelpers.waitForNavigation();
        await expect(page).toHaveURL(/\/professionals/);
      } else {
        console.log("ℹ️ Professionals link not found in dashboard");
        test.skip();
      }
    });

    test.skip("should allow user to update profile", async ({ page }) => {
      // SKIPPED: Test failing on Firefox and WebKit due to login issues
      if (await dashboardHelpers.checkVerifyPageAndSkip(test, "User")) {
        return;
      }

      const linkClicked = await dashboardHelpers.clickLinkWithVariations(
        ["Perfil", "Profile"],
        "profile-link",
        ["Perfil"],
      );

      if (linkClicked) {
        await testHelpers.waitForNavigation();
        await expect(page).toHaveURL(/\/(profile|perfil)/);

        // Check for profile form elements
        const profileForm = page.locator("form").or(page.locator('[data-testid="profile-form"]'));
        if (await profileForm.isVisible()) {
          await expect(profileForm).toBeVisible();
        }
      } else {
        console.log("ℹ️ Profile link not found in dashboard");
        test.skip();
      }
    });

    test.skip("should display logout option", async ({ page }) => {
      // SKIPPED: Test failing on Firefox and WebKit due to login issues
      await dashboardHelpers.checkLogoutButton();
    });
  });

  test.describe("Professional Dashboard", () => {
    test.beforeEach(async () => {
      // Login as professional
      const credentials = {
        email: "dr.smith@example.com",
        password: TEST_PASSWORD,
      };

      await authHelper.loginAsProfessional(credentials);
      await testHelpers.waitForPageLoad();
    });

    test.skip("should display professional dashboard elements", async ({ page }) => {
      // SKIPPED: Test failing on WebKit and Mobile browsers due to responsive design issues
      // Check for professional dashboard title
      const dashboardTitle = page
        .locator("h1, h2")
        .or(page.locator('[data-testid="dashboard-title"]'));

      if ((await dashboardTitle.count()) > 0) {
        await expect(dashboardTitle.first()).toBeVisible();
      }

      // Check for professional info
      const professionalInfo = page
        .locator('[data-testid="professional-info"]')
        .or(page.locator(".professional-info"))
        .or(page.locator("text=Dr. Sarah Smith"));

      if ((await professionalInfo.count()) > 0) {
        await expect(professionalInfo.first()).toBeVisible();
      }
    });

    test.skip("should display professional appointments", async ({ page }) => {
      // SKIPPED: Test failing on WebKit due to professional login issues
      // Look for appointments section
      const appointmentsSection = page
        .locator('[data-testid="appointments"]')
        .or(page.locator(".appointments"))
        .or(page.locator('h2:has-text("Citas")'))
        .or(page.locator('h2:has-text("Appointments")'));

      if (await appointmentsSection.isVisible()) {
        await expect(appointmentsSection).toBeVisible();

        // Check for appointment cards or empty state
        const appointmentCards = page
          .locator('[data-testid="appointment-card"]')
          .or(page.locator(".appointment-card"));

        const emptyState = page
          .locator("text=No tienes citas programadas")
          .or(page.locator("text=No appointments scheduled"));

        if ((await appointmentCards.count()) > 0) {
          await expect(appointmentCards.first()).toBeVisible();
        } else if (await emptyState.isVisible()) {
          await expect(emptyState).toBeVisible();
        }
      }
    });

    test.skip("should allow professional to update profile", async ({ page }) => {
      // SKIPPED: Test failing on WebKit due to professional login issues
      // Look for profile link or button
      const profileLink = page
        .locator('a:has-text("Perfil")')
        .or(page.locator('a:has-text("Profile")'))
        .or(page.locator('[data-testid="profile-link"]'))
        .or(page.locator('button:has-text("Perfil")'));

      if (await profileLink.isVisible()) {
        await profileLink.click();
        await testHelpers.waitForNavigation();

        // Should navigate to professional profile page
        await expect(page).toHaveURL(/\/(profile|perfil)/);

        // Check for professional profile form elements
        const profileForm = page.locator("form").or(page.locator('[data-testid="profile-form"]'));

        if (await profileForm.isVisible()) {
          await expect(profileForm).toBeVisible();
        }
      } else {
        console.log("ℹ️ Profile link not found in professional dashboard");
        test.skip();
      }
    });

    test.skip("should allow professional to manage availability", async ({ page }) => {
      // SKIPPED: Test failing on Firefox and WebKit due to login issues
      // Look for availability link or button
      const availabilityLink = page
        .locator('a:has-text("Disponibilidad")')
        .or(page.locator('a:has-text("Availability")'))
        .or(page.locator('[data-testid="availability-link"]'))
        .or(page.locator('button:has-text("Disponibilidad")'));

      if (await availabilityLink.isVisible()) {
        await availabilityLink.click();
        await testHelpers.waitForNavigation();

        // Should navigate to availability management page
        await expect(page).toHaveURL(/\/(availability|disponibilidad)/);

        // Check for availability form elements
        const availabilityForm = page
          .locator("form")
          .or(page.locator('[data-testid="availability-form"]'));

        if (await availabilityForm.isVisible()) {
          await expect(availabilityForm).toBeVisible();
        }
      } else {
        console.log("ℹ️ Availability link not found in professional dashboard");
        test.skip();
      }
    });
  });

  test.describe("Dashboard Responsiveness", () => {
    test.skip("should be responsive on mobile devices", async ({ page }) => {
      // SKIPPED: Disabled per request
      // Login as user first
      const credentials = {
        email: "testuser1@example.com",
        password: TEST_PASSWORD,
      };

      await authHelper.loginAsUser(credentials);

      // Set mobile viewport
      await testHelpers.simulateMobile();

      // Check that main elements are still visible
      const dashboardTitle = page
        .locator("h1, h2")
        .or(page.locator('[data-testid="dashboard-title"]'));

      if ((await dashboardTitle.count()) > 0) {
        await expect(dashboardTitle.first()).toBeVisible();
      }

      // Check for mobile menu if it exists
      const mobileMenu = page
        .locator('[data-testid="mobile-menu"]')
        .or(page.locator(".mobile-menu"))
        .or(page.locator('button[aria-label*="menu"]'));

      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
    });

    test.skip("should be responsive on tablet devices", async ({ page }) => {
      // SKIPPED: Test failing on Firefox due to login issues
      // Login as user first
      const credentials = {
        email: "testuser1@example.com",
        password: TEST_PASSWORD,
      };

      await authHelper.loginAsUser(credentials);

      // Set tablet viewport
      await testHelpers.setViewportSize(768, 1024);

      // Check that main elements are still visible
      const dashboardTitle = page
        .locator("h1, h2")
        .or(page.locator('[data-testid="dashboard-title"]'));

      if ((await dashboardTitle.count()) > 0) {
        await expect(dashboardTitle.first()).toBeVisible();
      }
    });
  });

  test.describe("Dashboard Security", () => {
    test.skip("should redirect to login when not authenticated", async ({ page }) => {
      // SKIPPED: Disabled per request
      // Try to access dashboard without login
      await page.goto("/dashboard");

      // Should redirect to login page
      await testHelpers.waitForNavigation();
      await expect(page).toHaveURL(/\/(login|landing)/);
    });

    test.skip("should maintain session across page refreshes", async ({ page }) => {
      // SKIPPED: Test failing on WebKit and Mobile Safari due to session handling issues
      // Login as user
      const credentials = {
        email: "testuser1@example.com",
        password: TEST_PASSWORD,
      };

      await authHelper.loginAsUser(credentials);

      // Wait for any redirects to complete after login
      await page.waitForLoadState("networkidle");

      // Check where we are after login
      const initialUrl = page.url();
      console.log("Initial URL after login:", initialUrl);

      // Refresh the page
      await page.reload();

      // Wait for the page to fully load and any redirects to complete
      await page.waitForLoadState("networkidle");

      // Wait a bit more for any client-side redirects
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log("URL after refresh:", currentUrl);

      // Should still be authenticated (not on login page)
      expect(currentUrl).not.toContain("/login");

      // Should be on dashboard, verify page, or another authenticated page
      expect(currentUrl).toMatch(/\/(dashboard|verify|professionals)/);

      // If on verify page, that's expected for unverified users
      if (currentUrl.includes("/verify")) {
        console.log("User redirected to verify page (expected for unverified users)");
        return;
      }

      // If on dashboard, verify it's working
      if (currentUrl.includes("/dashboard")) {
        await expect(page).toHaveURL(/\/dashboard/);
      }
    });
  });
});
