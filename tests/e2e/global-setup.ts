import { request } from "@playwright/test";

import { DataSeeder } from "./utils/data-seeder";

async function globalSetup() {
  console.log("🚀 Starting E2E test setup...");

  // Get backend URL from environment variable or fallback to localhost
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  console.log(`🌐 Using backend URL: ${backendUrl}`);

  // Create API request context
  const apiRequest = await request.newContext({
    baseURL: backendUrl,
  });

  // Initialize data seeder
  const dataSeeder = new DataSeeder(apiRequest);

  try {
    // Ensure test data exists
    await dataSeeder.ensureDataExists();
    console.log("✅ Test data setup completed");
  } catch (error) {
    console.error("❌ Error setting up test data:", error);
    // Don't fail the setup if data seeding fails
    // Tests should handle empty data gracefully
  } finally {
    await apiRequest.dispose();
  }

  console.log("✅ E2E test setup completed");
}

export default globalSetup;
