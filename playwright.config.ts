import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration
 *
 * This configuration supports both full testing and fast development modes.
 *
 * Usage:
 * - npm run test:e2e          # Full test suite (all browsers)
 * - npm run test:e2e:fast     # Fast mode (Chromium only, shorter timeouts)
 * - npm run test:e2e:chromium # Chromium only
 * - npm run test:e2e:firefox  # Firefox only
 * - npm run test:e2e:webkit   # Safari only
 * - npm run test:e2e:mobile   # Mobile browsers only
 *
 * Note: Frontend must be started manually with `npm run dev`
 *       Backend must be started manually with `cd backend && source venv/bin/activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Optimize workers for faster execution */
  workers: process.env.CI ? 2 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  globalTeardown: require.resolve("./tests/e2e/global-teardown.ts"),

  /* Optimized timeouts for faster execution */
  timeout: 15 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
});
