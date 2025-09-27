import { request } from "@playwright/test";

import { DataSeeder } from "./utils/data-seeder";

async function globalTeardown() {
  console.log("🧹 Starting E2E test teardown...");

  // Get backend URL from environment variable or fallback to localhost
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
  console.log(`🌐 Using backend URL: ${backendUrl}`);

  // Create API request context
  const apiRequest = await request.newContext({
    baseURL: backendUrl,
  });

  // Initialize data seeder
  const dataSeeder = new DataSeeder(apiRequest);

  try {
    // Clean up test data (optional - data might be useful for other tests)
    await dataSeeder.cleanupTestData();
    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.error("❌ Error during test data cleanup:", error);
    // Don't fail teardown if cleanup fails
  } finally {
    await apiRequest.dispose();
  }

  console.log("✅ E2E test teardown completed");
}

export default globalTeardown;
