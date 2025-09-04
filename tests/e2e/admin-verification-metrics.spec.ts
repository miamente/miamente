import { test, expect } from "@playwright/test";

import { AdminPage } from "./page-objects/admin-page";
import { AuthPage } from "./page-objects/auth-page";
import { ProfessionalPage } from "./page-objects/professional-page";
import { TEST_USERS, generateTestEmail } from "./utils/test-data-seeder";

test.describe("Admin Professional Verification and Metrics @e2e", () => {
  let authPage: AuthPage;
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    adminPage = new AdminPage(page);
  });

  test("should complete admin professional verification flow", async ({ page }) => {
    const adminEmail = generateTestEmail("admin");
    const proEmail = generateTestEmail("professional");

    // Step 1: Admin registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, adminEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Step 2: Professional registration and profile setup
    const proPage = await page.context().newPage();
    const proAuthPage = new AuthPage(proPage);
    const proProfessionalPage = new ProfessionalPage(proPage);

    await proAuthPage.gotoRegister();
    await proAuthPage.fillRegistrationForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await proAuthPage.submitRegistration();
    await mockEmailVerification(proPage, proEmail);

    await proAuthPage.gotoLogin();
    await proAuthPage.fillLoginForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await proAuthPage.submitLogin();

    // Complete professional profile
    await proProfessionalPage.gotoProfile();
    await proProfessionalPage.fillProfessionalProfile({
      fullName: TEST_USERS.professional.fullName,
      phone: TEST_USERS.professional.phone,
      specialty: TEST_USERS.professional.specialty,
      rateCents: TEST_USERS.professional.rateCents,
      bio: TEST_USERS.professional.bio,
    });
    await proProfessionalPage.submitProfile();
    await proProfessionalPage.expectProfileSaved();

    await proPage.close();

    // Step 3: Admin verifies professional
    await adminPage.gotoProfessionals();
    await adminPage.expectTableLoaded("professionals");

    // Find the professional in the table
    const professionalRow = page.locator(`tr:has-text("${TEST_USERS.professional.fullName}")`);
    await expect(professionalRow).toBeVisible();

    // Check that professional is not verified initially
    await expect(professionalRow.locator("text=No verificado")).toBeVisible();

    // Click verify button
    await professionalRow.locator('button:has-text("Verificar")').click();

    // Confirm verification
    await page.locator('button:has-text("Confirmar Verificación")').click();

    // Verify success message
    await adminPage.expectProfessionalVerified();

    // Verify professional status changed to verified
    await expect(professionalRow.locator("text=Verificado")).toBeVisible();
  });

  test("should display admin dashboard metrics", async ({ page }) => {
    const adminEmail = generateTestEmail("admin");

    // Admin registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, adminEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Navigate to admin dashboard
    await adminPage.gotoDashboard();
    await adminPage.expectDashboardLoaded();
    await adminPage.expectMetricsVisible();

    // Verify metrics cards are displayed
    const metricsCards = adminPage.metricsCards;
    await expect(metricsCards).toHaveCount(4);

    // Check specific metrics
    await expect(metricsCards.nth(0)).toContainText("Usuarios Registrados");
    await expect(metricsCards.nth(1)).toContainText("Profesionales Verificados");
    await expect(metricsCards.nth(2)).toContainText("Citas Confirmadas");
    await expect(metricsCards.nth(3)).toContainText("Conversión de Pagos");

    // Verify analytics charts are visible
    await expect(adminPage.analyticsChart).toBeVisible();
    await expect(adminPage.conversionFunnel).toBeVisible();
  });

  test("should manage appointments and payments", async ({ page }) => {
    const adminEmail = generateTestEmail("admin");

    // Admin registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, adminEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Navigate to appointments management
    await adminPage.gotoAppointments();
    await adminPage.expectTableLoaded("appointments");

    // Verify appointments table has data
    const appointmentsTable = adminPage.appointmentsTable;
    await expect(appointmentsTable.locator("tbody tr")).toHaveCount.greaterThan(0);

    // Test appointment actions
    const appointmentRow = appointmentsTable.locator("tbody tr").first();
    await expect(appointmentRow.locator('button:has-text("Ver")')).toBeVisible();
    await expect(appointmentRow.locator('button:has-text("Cancelar")')).toBeVisible();

    // Navigate to payments management
    await adminPage.gotoPayments();
    await adminPage.expectTableLoaded("payments");

    // Verify payments table has data
    const paymentsTable = adminPage.paymentsTable;
    await expect(paymentsTable.locator("tbody tr")).toHaveCount.greaterThan(0);

    // Test payment actions
    const paymentRow = paymentsTable.locator("tbody tr").first();
    await expect(paymentRow.locator('button:has-text("Ver")')).toBeVisible();
    await expect(paymentRow.locator('button:has-text("Reenviar Email")')).toBeVisible();
  });

  test("should manage feature flags", async ({ page }) => {
    const adminEmail = generateTestEmail("admin");

    // Admin registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, adminEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Navigate to feature flags
    await page.goto("/admin/feature-flags");
    await page.waitForLoadState("networkidle");

    // Verify feature flags section is visible
    await expect(adminPage.featureFlagsSection).toBeVisible();

    // Find a feature flag toggle
    const featureFlagToggle = adminPage.toggleFlagButton.first();
    await expect(featureFlagToggle).toBeVisible();

    // Toggle a feature flag
    await featureFlagToggle.click();

    // Verify success message
    await adminPage.expectFeatureFlagToggled();

    // Verify toggle state changed
    await expect(featureFlagToggle).toHaveAttribute("data-state", "checked");
  });

  test("should export data to CSV", async ({ page }) => {
    const adminEmail = generateTestEmail("admin");

    // Admin registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, adminEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Test appointments CSV export
    await adminPage.gotoAppointments();

    // Set up download promise
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    await page.locator('button:has-text("Exportar CSV")').click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/appointments.*\.csv$/);

    // Test payments CSV export
    await adminPage.gotoPayments();

    const paymentsDownloadPromise = page.waitForEvent("download");
    await page.locator('button:has-text("Exportar CSV")').click();

    const paymentsDownload = await paymentsDownloadPromise;
    expect(paymentsDownload.suggestedFilename()).toMatch(/payments.*\.csv$/);
  });

  test("should filter and search data", async ({ page }) => {
    const adminEmail = generateTestEmail("admin");

    // Admin registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, adminEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: adminEmail,
      password: TEST_USERS.admin.password,
    });
    await authPage.submitLogin();

    // Test professionals filtering
    await adminPage.gotoProfessionals();

    // Filter by verification status
    await page.locator('select[name="verification-status"]').selectOption("verified");
    await page.waitForLoadState("networkidle");

    // Verify only verified professionals are shown
    const verifiedRows = page.locator('tr:has-text("Verificado")');
    await expect(verifiedRows).toHaveCount.greaterThan(0);

    // Test search functionality
    await page.locator('input[name="search"]').fill(TEST_USERS.professional.fullName);
    await page.locator('button:has-text("Buscar")').click();
    await page.waitForLoadState("networkidle");

    // Verify search results
    await expect(page.locator(`tr:has-text("${TEST_USERS.professional.fullName}")`)).toBeVisible();
  });

  test("should handle admin access control", async ({ page }) => {
    const userEmail = generateTestEmail("user");

    // Regular user registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: userEmail,
      password: TEST_USERS.user.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, userEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: userEmail,
      password: TEST_USERS.user.password,
    });
    await authPage.submitLogin();

    // Try to access admin dashboard
    await page.goto("/admin");

    // Should be redirected or show access denied
    await expect(page.locator("text=Acceso denegado")).toBeVisible();

    // Try to access admin professionals page
    await page.goto("/admin/professionals");

    // Should be redirected or show access denied
    await expect(page.locator("text=Acceso denegado")).toBeVisible();
  });
});
