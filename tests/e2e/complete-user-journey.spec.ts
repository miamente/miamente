import { test, expect } from "@playwright/test";

import { AdminPage } from "./page-objects/admin-page";
import { AuthPage } from "./page-objects/auth-page";
import { BookingPage } from "./page-objects/booking-page";
import { ProfessionalPage } from "./page-objects/professional-page";
import {
  TEST_USERS,
  generateTestEmail,
  mockEmailVerification,
  mockPaymentProcessing,
  mockEmailSending,
} from "./utils/test-data-seeder";

test.describe("Complete User Journey E2E @e2e", () => {
  test("should complete full platform workflow: registration → professional setup → booking → payment → review → admin verification", async ({
    page,
  }) => {
    const adminEmail = generateTestEmail("admin");
    const proEmail = generateTestEmail("professional");
    const userEmail = generateTestEmail("user");

    // ===== PHASE 1: ADMIN SETUP =====
    console.log("🚀 Phase 1: Admin Setup");

    const authPage = new AuthPage(page);
    const adminPage = new AdminPage(page);

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

    // Verify admin dashboard access
    await adminPage.gotoDashboard();
    await adminPage.expectDashboardLoaded();

    // ===== PHASE 2: PROFESSIONAL REGISTRATION =====
    console.log("👨‍⚕️ Phase 2: Professional Registration");

    const proPage = await page.context().newPage();
    const proAuthPage = new AuthPage(proPage);
    const proProfessionalPage = new ProfessionalPage(proPage);

    // Professional registration
    await proAuthPage.gotoRegister();
    await proAuthPage.fillRegistrationForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await proAuthPage.submitRegistration();
    await mockEmailVerification(proPage, proEmail);

    // Professional login
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

    // Create availability slots
    await proProfessionalPage.gotoAvailability();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];

    await proProfessionalPage.createAvailabilitySlot({
      date: dateString,
      time: "09:00",
      duration: 60,
    });
    await proProfessionalPage.expectSlotCreated();

    // Create additional slots
    await proProfessionalPage.createAvailabilitySlot({
      date: dateString,
      time: "10:00",
      duration: 60,
    });
    await proProfessionalPage.expectSlotCreated();

    await proPage.close();

    // ===== PHASE 3: ADMIN VERIFICATION =====
    console.log("✅ Phase 3: Admin Verification");

    // Admin verifies professional
    await adminPage.gotoProfessionals();
    await adminPage.expectTableLoaded("professionals");

    const professionalRow = page.locator(`tr:has-text("${TEST_USERS.professional.fullName}")`);
    await expect(professionalRow).toBeVisible();
    await expect(professionalRow.locator("text=No verificado")).toBeVisible();

    await professionalRow.locator('button:has-text("Verificar")').click();
    await page.locator('button:has-text("Confirmar Verificación")').click();
    await adminPage.expectProfessionalVerified();

    // ===== PHASE 4: USER REGISTRATION AND BOOKING =====
    console.log("👤 Phase 4: User Registration and Booking");

    const userPage = await page.context().newPage();
    const userAuthPage = new AuthPage(userPage);
    const userBookingPage = new BookingPage(userPage);

    // User registration
    await userAuthPage.gotoRegister();
    await userAuthPage.fillRegistrationForm({
      email: userEmail,
      password: TEST_USERS.user.password,
    });
    await userAuthPage.submitRegistration();
    await mockEmailVerification(userPage, userEmail);

    // User login
    await userAuthPage.gotoLogin();
    await userAuthPage.fillLoginForm({
      email: userEmail,
      password: TEST_USERS.user.password,
    });
    await userAuthPage.submitLogin();

    // Browse professionals
    await userBookingPage.gotoProfessionals();
    await expect(userPage.locator('[data-testid="professional-card"]')).toHaveCount.greaterThan(0);

    // Select professional and book slot
    await userBookingPage.selectProfessional();
    await userBookingPage.selectAvailableSlot();

    // ===== PHASE 5: PAYMENT PROCESSING =====
    console.log("💳 Phase 5: Payment Processing");

    // Fill payment form
    await userBookingPage.fillPaymentForm({
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });

    // Submit payment
    await userBookingPage.submitPayment();

    // Mock payment processing
    const paymentSuccess = await mockPaymentProcessing(userPage, TEST_USERS.professional.rateCents);
    expect(paymentSuccess).toBe(true);

    // ===== PHASE 6: CONFIRMATION AND EMAIL =====
    console.log("📧 Phase 6: Confirmation and Email");

    // Verify booking confirmation
    await userBookingPage.expectBookingConfirmation();
    await userBookingPage.expectJitsiUrl();

    // Mock email sending
    await mockEmailSending(userPage, userEmail, "Confirmación de Cita - Miamente");

    // Verify Jitsi URL
    const displayedJitsiUrl = await userBookingPage.jitsiUrl.getAttribute("href");
    expect(displayedJitsiUrl).toMatch(/meet\.jit\.si\/miamente-/);

    // ===== PHASE 7: REVIEW SYSTEM =====
    console.log("⭐ Phase 7: Review System");

    // Navigate to completed appointments (simulated)
    await userPage.goto("/dashboard/user/appointments");
    await userPage.waitForLoadState("networkidle");

    // Find completed appointment and submit review
    const completedAppointment = userPage.locator('[data-testid="completed-appointment"]').first();
    await completedAppointment.waitFor({ state: "visible" });

    await completedAppointment.locator('button:has-text("Calificar")').click();
    await userBookingPage.openReviewModal();
    await userBookingPage.submitReview(
      5,
      "Excelente profesional, muy recomendado. La sesión fue muy útil.",
    );
    await userBookingPage.expectReviewSubmitted();

    await userPage.close();

    // ===== PHASE 8: ADMIN METRICS VERIFICATION =====
    console.log("📊 Phase 8: Admin Metrics Verification");

    // Verify admin dashboard shows updated metrics
    await adminPage.gotoDashboard();
    await adminPage.expectMetricsVisible();

    // Check that metrics have been updated
    const metricsCards = adminPage.metricsCards;
    await expect(metricsCards.nth(0)).toContainText("Usuarios Registrados");
    await expect(metricsCards.nth(1)).toContainText("Profesionales Verificados");
    await expect(metricsCards.nth(2)).toContainText("Citas Confirmadas");
    await expect(metricsCards.nth(3)).toContainText("Conversión de Pagos");

    // Verify analytics charts are working
    await expect(adminPage.analyticsChart).toBeVisible();
    await expect(adminPage.conversionFunnel).toBeVisible();

    // ===== PHASE 9: DATA EXPORT AND MANAGEMENT =====
    console.log("📋 Phase 9: Data Export and Management");

    // Test appointments export
    await adminPage.gotoAppointments();
    await adminPage.expectTableLoaded("appointments");

    // Test payments export
    await adminPage.gotoPayments();
    await adminPage.expectTableLoaded("payments");

    // ===== PHASE 10: FEATURE FLAGS =====
    console.log("🚩 Phase 10: Feature Flags");

    // Test feature flag management
    await page.goto("/admin/feature-flags");
    await page.waitForLoadState("networkidle");

    await expect(adminPage.featureFlagsSection).toBeVisible();

    const featureFlagToggle = adminPage.toggleFlagButton.first();
    await expect(featureFlagToggle).toBeVisible();

    await featureFlagToggle.click();
    await adminPage.expectFeatureFlagToggled();

    console.log("🎉 Complete user journey test completed successfully!");
  });

  test("should handle error scenarios gracefully", async ({ page }) => {
    const userEmail = generateTestEmail("user");

    const authPage = new AuthPage(page);
    const bookingPage = new BookingPage(page);

    // User registration and login
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

    // Test payment failure scenario
    await bookingPage.gotoProfessionals();
    await bookingPage.selectProfessional();
    await bookingPage.selectAvailableSlot();

    // Use declined card
    await bookingPage.fillPaymentForm({
      cardNumber: "4000000000000002",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });

    await bookingPage.submitPayment();

    // Should handle payment failure gracefully
    await expect(page.locator("text=Pago rechazado")).toBeVisible();
    await expect(page.locator("text=Intenta con otra tarjeta")).toBeVisible();

    // Should allow retry with different card
    await bookingPage.fillPaymentForm({
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });

    await bookingPage.submitPayment();

    // Mock successful payment
    const paymentSuccess = await mockPaymentProcessing(page, TEST_USERS.professional.rateCents);
    expect(paymentSuccess).toBe(true);

    // Should complete booking successfully
    await bookingPage.expectBookingConfirmation();
  });
});
