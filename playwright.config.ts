import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "5173";
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  forbidOnly: isCI,
  fullyParallel: !isCI, // Run in parallel locally, sequential in CI for stability
  timeout: 60_000,
  expect: {
    timeout: 10_000, // Increased for better reliability
  },
  globalSetup: "./e2e/setup/global-setup.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Only run other browsers in CI or when explicitly requested
    ...(isCI || process.env.ALL_BROWSERS
      ? [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
  ],
  reporter: [["html", { open: "never" }], ["list"], ...(isCI ? [["github"]] : [])],
  retries: isCI ? 2 : 1, // Allow one retry locally for flaky tests
  testDir: "./e2e",
  outputDir: "./.playwright/test-results",
  snapshotDir: "./.playwright/snapshots",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000, // Increased for better reliability
    navigationTimeout: 30_000, // Increased for slower networks
  },
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000, // Increased timeout for dev server startup
    stdout: "ignore",
    stderr: "pipe",
  },
  workers: isCI ? 1 : undefined, // Sequential in CI, parallel locally
});
