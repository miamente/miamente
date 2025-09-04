// import { FullConfig } from '@playwright/test';
import { cleanupTestData } from "./utils/test-data-seeder";

async function globalTeardown() {
  console.log("🧹 Starting E2E test global teardown...");

  try {
    // Clean up test data
    console.log("🗑️ Cleaning up test data...");
    await cleanupTestData();

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
