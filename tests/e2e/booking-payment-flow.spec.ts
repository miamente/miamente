import { test, expect } from "@playwright/test";

import { AuthPage } from "./page-objects/auth-page";
import { BookingPage } from "./page-objects/booking-page";
import { ProfessionalPage } from "./page-objects/professional-page";
import { TEST_USERS, generateTestEmail, mockPaymentProcessing } from "./utils/test-data-seeder";

test.describe("Professional Slot Creation and User Booking Flow @e2e", () => {
  let authPage: AuthPage;
  let professionalPage: ProfessionalPage;
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    professionalPage = new ProfessionalPage(page);
    bookingPage = new BookingPage(page);
  });

  test("should complete full booking flow: pro creates slots → user books → payment → confirmation", async ({
    page,
  }) => {
    const proEmail = generateTestEmail("professional");
    const userEmail = generateTestEmail("user");

    // Step 1: Professional registration and profile setup
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, proEmail);

    // Login as professional
    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await authPage.submitLogin();

    // Complete professional profile
    await professionalPage.gotoProfile();
    await professionalPage.fillProfessionalProfile({
      fullName: TEST_USERS.professional.fullName,
      phone: TEST_USERS.professional.phone,
      specialty: TEST_USERS.professional.specialty,
      rateCents: TEST_USERS.professional.rateCents,
      bio: TEST_USERS.professional.bio,
    });
    await professionalPage.submitProfile();
    await professionalPage.expectProfileSaved();

    // Create availability slots
    await professionalPage.gotoAvailability();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];

    await professionalPage.createAvailabilitySlot({
      date: dateString,
      time: "09:00",
      duration: 60,
    });
    await professionalPage.expectSlotCreated();

    // Step 2: User registration and booking
    // Open new page for user
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

    // Browse professionals and book slot
    await userBookingPage.gotoProfessionals();
    await userBookingPage.selectProfessional();
    await userBookingPage.selectAvailableSlot();

    // Step 3: Payment processing
    const paymentData = {
      cardNumber: "4111111111111111", // Test card number
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    };

    await userBookingPage.fillPaymentForm(paymentData);
    await userBookingPage.submitPayment();

    // Mock payment processing
    const paymentSuccess = await mockPaymentProcessing(userPage, TEST_USERS.professional.rateCents);
    expect(paymentSuccess).toBe(true);

    // Step 4: Confirmation and Jitsi URL
    await userBookingPage.expectBookingConfirmation();
    await userBookingPage.expectJitsiUrl();

    // Verify Jitsi URL is generated
    const jitsiUrl = await userBookingPage.jitsiUrl.getAttribute("href");
    expect(jitsiUrl).toMatch(/meet\.jit\.si\/miamente-/);

    await userPage.close();
  });

  test("should handle payment failure gracefully", async ({ page }) => {
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

    // Navigate to booking
    await bookingPage.gotoProfessionals();
    await bookingPage.selectProfessional();
    await bookingPage.selectAvailableSlot();

    // Fill payment form with invalid card
    await bookingPage.fillPaymentForm({
      cardNumber: "4000000000000002", // Declined card
      expiry: "12/25",
      cvv: "123",
      cardholderName: "Test User",
    });

    await bookingPage.submitPayment();

    // Should show payment error
    await expect(page.locator("text=Pago rechazado")).toBeVisible();
    await expect(page.locator("text=Intenta con otra tarjeta")).toBeVisible();
  });

  test("should handle slot booking conflicts", async ({ page }) => {
    const user1Email = generateTestEmail("user1");
    const user2Email = generateTestEmail("user2");

    // Both users register and login
    for (const email of [user1Email, user2Email]) {
      const userPage = await page.context().newPage();
      const userAuthPage = new AuthPage(userPage);

      await userAuthPage.gotoRegister();
      await userAuthPage.fillRegistrationForm({
        email: email,
        password: TEST_USERS.user.password,
      });
      await userAuthPage.submitRegistration();
      await mockEmailVerification(userPage, email);

      await userAuthPage.gotoLogin();
      await userAuthPage.fillLoginForm({
        email: email,
        password: TEST_USERS.user.password,
      });
      await userAuthPage.submitLogin();

      await userPage.close();
    }

    // User 1 books the slot
    const user1Page = await page.context().newPage();
    const user1BookingPage = new BookingPage(user1Page);

    await user1BookingPage.gotoProfessionals();
    await user1BookingPage.selectProfessional();
    await user1BookingPage.selectAvailableSlot();

    // User 2 tries to book the same slot
    const user2Page = await page.context().newPage();
    const user2BookingPage = new BookingPage(user2Page);

    await user2BookingPage.gotoProfessionals();
    await user2BookingPage.selectProfessional();

    // Should show slot as unavailable
    await expect(user2Page.locator("text=No disponible")).toBeVisible();

    await user1Page.close();
    await user2Page.close();
  });

  test("should validate payment form fields", async ({ page }) => {
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

    // Navigate to booking
    await bookingPage.gotoProfessionals();
    await bookingPage.selectProfessional();
    await bookingPage.selectAvailableSlot();

    // Try to submit empty payment form
    await bookingPage.submitPayment();

    // Should show validation errors
    await bookingPage.expectValidationError("cardNumber");
    await bookingPage.expectValidationError("expiry");
    await bookingPage.expectValidationError("cvv");
    await bookingPage.expectValidationError("cardholderName");
  });

  test("should handle professional slot creation validation", async ({ page }) => {
    const proEmail = generateTestEmail("professional");

    // Professional registration and login
    await authPage.gotoRegister();
    await authPage.fillRegistrationForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await authPage.submitRegistration();
    await mockEmailVerification(page, proEmail);

    await authPage.gotoLogin();
    await authPage.fillLoginForm({
      email: proEmail,
      password: TEST_USERS.professional.password,
    });
    await authPage.submitLogin();

    // Try to create slot without filling form
    await professionalPage.gotoAvailability();
    await professionalPage.createSlotButton.click();

    // Should show validation errors
    await professionalPage.expectValidationError("date");
    await professionalPage.expectValidationError("time");
    await professionalPage.expectValidationError("duration");
  });
});
