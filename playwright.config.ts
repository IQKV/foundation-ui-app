import { defineConfig, devices } from "@playwright/test";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";

// Load .env.e2e before anything else so BASE_URL and E2E_* vars are available.
// Variables already set in the environment (e.g. CI secrets) are NOT overridden.
loadDotenv({ path: resolve(process.cwd(), ".env.e2e"), override: false });

const port = process.env["PORT"] ?? "5173";
const baseURL = process.env["BASE_URL"] ?? `http://localhost:${port}`;
const isCI = Boolean(process.env["CI"]);

// Skip the local dev server when BASE_URL points at a remote host.
const isRemote =
  baseURL.startsWith("https://") ||
  (baseURL.startsWith("http://") &&
    !baseURL.includes("localhost") &&
    !baseURL.includes("127.0.0.1"));

export default defineConfig({
  forbidOnly: isCI,
  fullyParallel: !isCI,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: "./e2e/setup/global-setup.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(isCI || process.env["ALL_BROWSERS"]
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],
  reporter: [["html", { open: "never" }], ["list"], ...(isCI ? ([["github"]] as const) : [])],
  retries: isCI ? 2 : 1,
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  outputDir: "./.playwright/test-results",
  snapshotDir: "./.playwright/snapshots",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  ...(!isRemote && {
    webServer: {
      command: "pnpm dev",
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  }),
  workers: isCI ? 1 : undefined,
});
