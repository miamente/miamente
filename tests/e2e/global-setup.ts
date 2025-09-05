import { FullConfig } from "@playwright/test";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(_config: FullConfig) {
  console.log("🚀 Starting E2E test setup...");

  // Optional: Start any required services or setup test data
  // For now, we'll just log that setup is complete

  console.log("✅ E2E test setup completed");
}

export default globalSetup;
