import { chromium, FullConfig } from "@playwright/test";

import { seedTestData } from "./utils/test-data-seeder";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting E2E test global setup...");

  // Set up test environment
  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the application to be ready
    console.log("⏳ Waiting for application to be ready...");
    await page.goto(baseURL);
    await page.waitForLoadState("networkidle");

    // Check if the app is running
    const isAppReady = await page.locator("body").isVisible();
    if (!isAppReady) {
      throw new Error("Application is not ready for testing");
    }

    console.log("✅ Application is ready for testing");

    // Seed test data if needed
    console.log("🌱 Seeding test data...");
    await seedTestData(page, baseURL);

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
