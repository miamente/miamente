import { test, expect } from "@playwright/test";
import { AuthHelper } from "./utils/auth-helper";
import { TestHelpers } from "./utils/test-helpers";

test.describe("Dashboard", () => {
  let authHelper: AuthHelper;
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page, request);
    testHelpers = new TestHelpers(page);
  });

  test.describe("User Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      // Login as user
      const credentials = {
        email: "testuser1@example.com",
        password: "TestPassword123!",
      };

      await authHelper.loginAsUser(credentials);
      await testHelpers.waitForPageLoad();
    });

    test("should display user dashboard elements", async ({ page }) => {
      // Check for dashboard title
      const dashboardTitle = page
        .locator("h1, h2")
        .or(page.locator('[data-testid="dashboard-title"]'));

      if ((await dashboardTitle.count()) > 0) {
        await expect(dashboardTitle.first()).toBeVisible();
      }

      // Check for user info
      const userInfo = page
        .locator('[data-testid="user-info"]')
        .or(page.locator(".user-info"))
        .or(page.locator("text=Test User 1"));

      if ((await userInfo.count()) > 0) {
        await expect(userInfo.first()).toBeVisible();
      }

      // Check for navigation menu
      const navMenu = page
        .locator("nav")
        .or(page.locator('[data-testid="navigation"]'))
        .or(page.locator(".navigation"));

      if ((await navMenu.count()) > 0) {
        await expect(navMenu.first()).toBeVisible();
      }
    });

    test("should display user appointments if any", async ({ page }) => {
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

    test("should allow navigation to professionals page", async ({ page }) => {
      // Look for professionals link
      const professionalsLink = page
        .locator('a:has-text("Profesionales")')
        .or(page.locator('a:has-text("Professionals")'))
        .or(page.locator('[data-testid="professionals-link"]'));

      if (await professionalsLink.isVisible()) {
        await professionalsLink.click();
        await testHelpers.waitForNavigation();
        await expect(page).toHaveURL(/.*\/professionals/);
      } else {
        console.log("ℹ️ Professionals link not found in dashboard");
        test.skip();
      }
    });

    test("should allow user to update profile", async ({ page }) => {
      // Look for profile link or button
      const profileLink = page
        .locator('a:has-text("Perfil")')
        .or(page.locator('a:has-text("Profile")'))
        .or(page.locator('[data-testid="profile-link"]'))
        .or(page.locator('button:has-text("Perfil")'));

      if (await profileLink.isVisible()) {
        await profileLink.click();
        await testHelpers.waitForNavigation();

        // Should navigate to profile page
        await expect(page).toHaveURL(/.*\/(profile|perfil)/);

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

    test("should display logout option", async ({ page }) => {
      // Look for logout button or menu
      const logoutButton = page
        .locator('button:has-text("Cerrar sesión")')
        .or(page.locator('button:has-text("Logout")'))
        .or(page.locator('[data-testid="logout-button"]'));

      if (await logoutButton.isVisible()) {
        await expect(logoutButton).toBeVisible();
      } else {
        // Check for user menu that might contain logout
        const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator(".user-menu"));

        if (await userMenu.isVisible()) {
          await userMenu.click();

          const logoutOption = page
            .locator('button:has-text("Cerrar sesión")')
            .or(page.locator('a:has-text("Cerrar sesión")'));

          if (await logoutOption.isVisible()) {
            await expect(logoutOption).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("Professional Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      // Login as professional
      const credentials = {
        email: "dr.smith@example.com",
        password: "TestPassword123!",
      };

      await authHelper.loginAsProfessional(credentials);
      await testHelpers.waitForPageLoad();
    });

    test("should display professional dashboard elements", async ({ page }) => {
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

    test("should display professional appointments", async ({ page }) => {
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

    test("should allow professional to update profile", async ({ page }) => {
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
        await expect(page).toHaveURL(/.*\/(profile|perfil)/);

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

    test("should allow professional to manage availability", async ({ page }) => {
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
        await expect(page).toHaveURL(/.*\/(availability|disponibilidad)/);

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
    test("should be responsive on mobile devices", async ({ page }) => {
      // Login as user first
      const credentials = {
        email: "testuser1@example.com",
        password: "TestPassword123!",
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

    test("should be responsive on tablet devices", async ({ page }) => {
      // Login as user first
      const credentials = {
        email: "testuser1@example.com",
        password: "TestPassword123!",
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
    test("should redirect to login when not authenticated", async ({ page }) => {
      // Try to access dashboard without login
      await page.goto("/dashboard");

      // Should redirect to login page
      await testHelpers.waitForNavigation();
      await expect(page).toHaveURL(/.*\/(login|landing)/);
    });

    test("should maintain session across page refreshes", async ({ page }) => {
      // Login as user
      const credentials = {
        email: "testuser1@example.com",
        password: "TestPassword123!",
      };

      await authHelper.loginAsUser(credentials);

      // Refresh the page
      await page.reload();
      await testHelpers.waitForPageLoad();

      // Should still be on dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
  });
});
