import { chromium, type FullConfig } from "@playwright/test";
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";
import { mkdirSync } from "fs";
import { AUTH_CONFIG } from "../config/auth.js";
import { signInAsTenantOwner } from "../fixtures/auth.fixture.js";

/**
 * Global setup — runs once before the entire test suite.
 *
 * 1. Loads .env.e2e so E2E_* variables are available to config modules.
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
    // Use domcontentloaded — networkidle hangs on apps with open WS/SSE connections.
    await verifyPage.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 60_000 });

    // Wait for React to mount
    await verifyPage.locator("#root").waitFor({ state: "attached", timeout: 30_000 });

    const title = await verifyPage.title();
    console.log(`✅ Host reachable — page title: "${title}"`);
    console.log("✅ React app is rendered");
  } finally {
    await verifyPage.close();
  }

  // ── 3. Pre-authenticate and save storage state ────────────────────────────
  mkdirSync(resolve(process.cwd(), ".playwright/auth"), { recursive: true });

  const authContext = await browser.newContext({ baseURL });
  const authPage = await authContext.newPage();

  try {
    console.log(`🔐 Signing in as tenant owner (${AUTH_CONFIG.TENANT_OWNER.email}) …`);
    await signInAsTenantOwner(authPage);
    await authContext.storageState({ path: AUTH_CONFIG.STORAGE_STATE });
    console.log(`✅ Auth state saved → ${AUTH_CONFIG.STORAGE_STATE}`);
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
