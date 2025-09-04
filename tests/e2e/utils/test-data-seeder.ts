import { Page } from "@playwright/test";

// Test data constants
export const TEST_USERS = {
  user: {
    email: "test-user@miamente.com",
    password: "TestPassword123!",
    fullName: "Test User",
    phone: "+573001234567",
  },
  professional: {
    email: "test-professional@miamente.com",
    password: "TestPassword123!",
    fullName: "Dr. Test Professional",
    phone: "+573001234568",
    specialty: "Psicología Clínica",
    rateCents: 80000,
    bio: "Profesional de prueba con experiencia en psicología clínica.",
  },
  admin: {
    email: "test-admin@miamente.com",
    password: "TestPassword123!",
    fullName: "Test Admin",
    phone: "+573001234569",
  },
};

export const TEST_DATA = {
  appointment: {
    duration: 60, // minutes
    timezone: "America/Bogota",
  },
  payment: {
    amount: 80000, // COP
    currency: "COP",
    sandbox: true,
  },
};

/**
 * Seed test data for E2E tests
 */
export async function seedTestData(page: Page): Promise<void> {
  console.log("🌱 Seeding test data...");

  try {
    // Note: In a real implementation, this would interact with your test database
    // For now, we'll just ensure the test environment is ready

    // Check if we can access the application
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify the landing page loads
    const landingTitle = page.locator("h1");
    await landingTitle.waitFor({ state: "visible" });

    console.log("✅ Test data seeding completed");
  } catch (error) {
    console.error("❌ Test data seeding failed:", error);
    throw error;
  }
}

/**
 * Clean up test data after E2E tests
 */
export async function cleanupTestData(): Promise<void> {
  console.log("🗑️ Cleaning up test data...");

  try {
    // Note: In a real implementation, this would clean up test data from your database
    // For now, we'll just log the cleanup

    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.error("❌ Test data cleanup failed:", error);
    throw error;
  }
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string = "test"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@miamente.com`;
}

/**
 * Generate unique test phone number
 */
export function generateTestPhone(): string {
  const random = Math.floor(Math.random() * 9000000) + 1000000;
  return `+57300${random}`;
}

/**
 * Wait for email verification (mock)
 */
export async function mockEmailVerification(page: Page, email: string): Promise<void> {
  console.log(`📧 Mocking email verification for ${email}`);

  // In a real implementation, this would:
  // 1. Check the email service for verification emails
  // 2. Extract the verification link
  // 3. Navigate to the verification link

  // For now, we'll simulate the verification process
  await page.waitForTimeout(2000); // Simulate email processing time

  console.log("✅ Email verification mocked successfully");
}

/**
 * Mock payment processing
 */
export async function mockPaymentProcessing(page: Page, amount: number): Promise<boolean> {
  console.log(`💳 Mocking payment processing for ${amount} COP`);

  // In a real implementation, this would:
  // 1. Interact with the payment gateway sandbox
  // 2. Process the payment
  // 3. Return the payment status

  // For now, we'll simulate successful payment
  await page.waitForTimeout(3000); // Simulate payment processing time

  console.log("✅ Payment processing mocked successfully");
  return true; // Simulate successful payment
}

/**
 * Mock Jitsi URL generation
 */
export function generateMockJitsiUrl(appointmentId: string): string {
  return `https://meet.jit.si/miamente-${appointmentId}`;
}

/**
 * Mock email sending
 */
export async function mockEmailSending(page: Page, to: string, subject: string): Promise<void> {
  console.log(`📧 Mocking email sending to ${to}: ${subject}`);

  // In a real implementation, this would:
  // 1. Check the email service for sent emails
  // 2. Verify the email content
  // 3. Extract any links or attachments

  // For now, we'll just simulate email sending
  await page.waitForTimeout(1000);

  console.log("✅ Email sending mocked successfully");
}
