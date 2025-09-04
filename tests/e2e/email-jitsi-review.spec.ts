import { test, expect } from "@playwright/test";

import { AuthPage } from "./page-objects/auth-page";
import { BookingPage } from "./page-objects/booking-page";
import { TEST_USERS, generateTestEmail, mockEmailSending } from "./utils/test-data-seeder";

test.describe("Email with Jitsi URL and Review System @e2e", () => {
  let authPage: AuthPage;
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    bookingPage = new BookingPage(page);
  });

  test("should send confirmation email with Jitsi URL after successful booking", async ({
    page,
  }) => {
    const userEmail = generateTestEmail("user");

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

    // Complete booking flow (simplified for this test)
    await bookingPage.gotoProfessionals();
    await bookingPage.selectProfessional();
    await bookingPage.selectAvailableSlot();

    // Mock successful payment
    await bookingPage.fillPaymentForm({
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });
    await bookingPage.submitPayment();

    // Verify booking confirmation
    await bookingPage.expectBookingConfirmation();
    await bookingPage.expectJitsiUrl();

    // Mock email sending
    await mockEmailSending(page, userEmail, "Confirmación de Cita - Miamente");

    // Verify email was sent (in real implementation, this would check email service)
    await expect(page.locator("text=Email de confirmación enviado")).toBeVisible();

    // Verify Jitsi URL in the page
    const displayedJitsiUrl = await bookingPage.jitsiUrl.getAttribute("href");
    expect(displayedJitsiUrl).toMatch(/meet\.jit\.si\/miamente-/);
  });

  test("should send reminder emails before appointment", async ({ page }) => {
    const userEmail = generateTestEmail("user");

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

    // Book appointment for tomorrow (to test 24h reminder)
    await bookingPage.gotoProfessionals();
    await bookingPage.selectProfessional();
    await bookingPage.selectAvailableSlot();

    // Complete booking
    await bookingPage.fillPaymentForm({
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });
    await bookingPage.submitPayment();

    // Mock 24-hour reminder email
    await mockEmailSending(page, userEmail, "Recordatorio de Cita - 24 horas");

    // Mock 1-hour reminder email
    await mockEmailSending(page, userEmail, "Recordatorio de Cita - 1 hora");

    // Verify reminder emails were sent
    await expect(page.locator("text=Recordatorios programados")).toBeVisible();
  });

  test("should allow user to submit review after appointment", async ({ page }) => {
    const userEmail = generateTestEmail("user");

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

    // Navigate to completed appointments (simulated)
    await page.goto("/dashboard/user/appointments");
    await page.waitForLoadState("networkidle");

    // Find a completed appointment
    const completedAppointment = page.locator('[data-testid="completed-appointment"]').first();
    await completedAppointment.waitFor({ state: "visible" });

    // Click on review button
    await completedAppointment.locator('button:has-text("Calificar")').click();

    // Submit review
    await bookingPage.openReviewModal();
    await bookingPage.submitReview(5, "Excelente profesional, muy recomendado");
    await bookingPage.expectReviewSubmitted();

    // Verify review appears in professional's profile
    await page.goto("/professionals");
    await page.locator('[data-testid="professional-card"]').first().click();

    // Should see the review
    await expect(page.locator("text=Excelente profesional, muy recomendado")).toBeVisible();
    await expect(page.locator('[data-testid="rating-5"]')).toBeVisible();
  });

  test("should prevent duplicate reviews for same appointment", async ({ page }) => {
    const userEmail = generateTestEmail("user");

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

    // Navigate to completed appointments
    await page.goto("/dashboard/user/appointments");
    await page.waitForLoadState("networkidle");

    // Find a completed appointment that already has a review
    const reviewedAppointment = page.locator('[data-testid="reviewed-appointment"]').first();
    await reviewedAppointment.waitFor({ state: "visible" });

    // Try to click review button again
    const reviewButton = reviewedAppointment.locator('button:has-text("Calificar")');

    // Should not be able to review again
    await expect(reviewButton).not.toBeVisible();

    // Or if visible, should show "Ya calificado"
    if (await reviewButton.isVisible()) {
      await expect(reviewButton).toHaveText("Ya calificado");
    }
  });

  test("should validate review form fields", async ({ page }) => {
    const userEmail = generateTestEmail("user");

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

    // Navigate to completed appointments
    await page.goto("/dashboard/user/appointments");
    await page.waitForLoadState("networkidle");

    // Open review modal
    const completedAppointment = page.locator('[data-testid="completed-appointment"]').first();
    await completedAppointment.locator('button:has-text("Calificar")').click();

    await bookingPage.openReviewModal();

    // Try to submit without rating
    await bookingPage.submitReviewButton.click();

    // Should show validation error
    await expect(page.locator("text=Debes seleccionar una calificación")).toBeVisible();

    // Try to submit with rating but no comment
    await bookingPage.ratingStars.locator('[data-rating="3"]').click();
    await bookingPage.submitReviewButton.click();

    // Should show validation error for comment
    await expect(page.locator("text=El comentario es requerido")).toBeVisible();
  });

  test("should send post-session email with review request", async ({ page }) => {
    const userEmail = generateTestEmail("user");

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

    // Simulate appointment completion
    await page.goto("/dashboard/user/appointments");
    await page.waitForLoadState("networkidle");

    // Mock post-session email
    await mockEmailSending(page, userEmail, "¿Cómo fue tu sesión? - Califica tu experiencia");

    // Verify post-session email was sent
    await expect(page.locator("text=Email de seguimiento enviado")).toBeVisible();

    // Verify email contains review link
    // In real implementation, this would check email content
    await expect(page.locator("text=Enlace de calificación incluido")).toBeVisible();
  });

  test("should handle email delivery failures gracefully", async ({ page }) => {
    const userEmail = generateTestEmail("user");

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

    // Complete booking
    await bookingPage.gotoProfessionals();
    await bookingPage.selectProfessional();
    await bookingPage.selectAvailableSlot();

    await bookingPage.fillPaymentForm({
      cardNumber: "4111111111111111",
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });
    await bookingPage.submitPayment();

    // Mock email delivery failure
    await page.route("**/send-email", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Email service unavailable" }),
      });
    });

    // Should still show booking confirmation even if email fails
    await bookingPage.expectBookingConfirmation();

    // Should show warning about email delivery
    await expect(page.locator("text=Email de confirmación no pudo ser enviado")).toBeVisible();
    await expect(page.locator("text=Reintentaremos enviarlo más tarde")).toBeVisible();
  });
});
