import { chromium, type FullConfig } from "@playwright/test";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";
import { mkdirSync } from "fs";
import { TEST_CONFIG } from "../config/test-config.js";
import { signInAsTenantOwner } from "../fixtures/auth.fixture.js";

/**
 * Global setup — runs once before the entire test suite.
 *
 * 1. Loads .env.e2e so E2E_* variables are available to test-config.ts.
 * 2. Verifies the target host is reachable.
 * 3. Signs in as the tenant owner and persists the browser storage state
 *    so individual tests can reuse the session without a per-test sign-in.
 */
async function globalSetup(config: FullConfig) {
  // ── 1. Load .env.e2e ──────────────────────────────────────────────────────
  // CI secrets already in process.env take precedence (override: false).
  loadDotenv({ path: resolve(process.cwd(), ".env.e2e"), override: false });

  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:5173";
  console.log(`\n🚀 E2E global setup — target: ${baseURL}`);

  const browser = await chromium.launch();

  // ── 2. Verify the host is reachable ───────────────────────────────────────
  const verifyPage = await browser.newPage();
  try {
    console.log(`📡 Checking connectivity to ${baseURL} …`);
    await verifyPage.goto(baseURL, { waitUntil: "networkidle", timeout: 60_000 });

    const title = await verifyPage.title();
    console.log(`✅ Host reachable — page title: "${title}"`);

    if ((await verifyPage.locator("#root").count()) === 0) {
      throw new Error("React app root element (#root) not found — is the app deployed?");
    }
    console.log("✅ React app is rendered");
  } finally {
    await verifyPage.close();
  }

  // ── 3. Pre-authenticate and save storage state ────────────────────────────
  mkdirSync(resolve(process.cwd(), ".playwright/auth"), { recursive: true });

  const authContext = await browser.newContext({ baseURL });
  const authPage = await authContext.newPage();

  try {
    const tenantOwner = TEST_CONFIG.TENANT_OWNER;
    if (!tenantOwner) {
      throw new Error(
        "TEST_CONFIG.TENANT_OWNER is undefined. Check your test-config.ts and environment variables.",
      );
    }
    console.log(`🔐 Signing in as tenant owner (${tenantOwner.email}) …`);
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
