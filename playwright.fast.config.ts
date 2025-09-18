import { defineConfig, devices } from "@playwright/test";

/**
 * Fast Playwright configuration for development
 * Optimized for speed over comprehensive coverage
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries for speed */
  retries: 0,
  /* Maximum workers for speed */
  workers: 6,
  /* Minimal reporter for speed */
  reporter: [["line"]],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    /* Minimal tracing for speed */
    trace: "off",
    /* No screenshots for speed */
    screenshot: "off",
    /* No video for speed */
    video: "off",
  },

  /* Only test on Chromium for speed */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000, // Reduced timeout
  },

  /* Global setup and teardown */
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  globalTeardown: require.resolve("./tests/e2e/global-teardown.ts"),

  /* Aggressive timeouts for speed */
  timeout: 10 * 1000,
  expect: {
    timeout: 3 * 1000,
  },
});
