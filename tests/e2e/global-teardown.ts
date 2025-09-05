import { FullConfig } from "@playwright/test";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalTeardown(_config: FullConfig) {
  console.log("🧹 Starting E2E test teardown...");

  // Optional: Clean up any test data or services
  // For now, we'll just log that teardown is complete

  console.log("✅ E2E test teardown completed");
}

export default globalTeardown;
