import { chromium, type FullConfig } from "@playwright/test";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";
import { mkdirSync } from "fs";
import { TEST_CONFIG } from "../config/test-config";
import { signInAsTenantOwner } from "../fixtures/auth.fixture";

/**
 * Global setup — runs once before the entire test suite.
 *
 * 1. Loads .env.e2e so E2E_* variables are available to test-config.ts.
 * 2. Verifies the target host is reachable.
 * 3. Signs in as the tenant owner and persists the browser storage state
 *    so individual tests can reuse the session without a per-test sign-in.
 */
async function globalSetup(config: FullConfig) {
  loadDotenv({ path: resolve(process.cwd(), ".env.e2e"), override: false });

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:5173";
  console.log(`\n🚀 E2E global setup — target: ${baseURL}`);

  const browser = await chromium.launch();

  // Verify the host is reachable
  const verifyPage = await browser.newPage();
  try {
    console.log(`📡 Checking connectivity to ${baseURL} …`);
    await verifyPage.goto(baseURL, { waitUntil: "networkidle", timeout: 60_000 });
    console.log(`✅ Host reachable — title: "${await verifyPage.title()}"`);

    if ((await verifyPage.locator("#root").count()) === 0) {
      throw new Error("React app root (#root) not found — is the app deployed?");
    }
  } finally {
    await verifyPage.close();
  }

  // Pre-authenticate and save storage state
  mkdirSync(resolve(process.cwd(), ".playwright/auth"), { recursive: true });

  const authContext = await browser.newContext();
  const authPage = await authContext.newPage();

  try {
    console.log(`🔐 Signing in as tenant owner (${TEST_CONFIG.TENANT_OWNER.email}) …`);
    await signInAsTenantOwner(authPage);
    await authContext.storageState({ path: TEST_CONFIG.STORAGE_STATE });
    console.log(`✅ Auth state saved → ${TEST_CONFIG.STORAGE_STATE}`);
  } catch (error) {
    console.error("❌ Tenant owner sign-in failed:", error);
    throw error;
  } finally {
    await authContext.close();
    await browser.close();
  }

  console.log("✅ Global setup complete\n");
}

export default globalSetup;
