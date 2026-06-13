import { test as base, expect, type Page } from "@playwright/test";
import { TEST_CONFIG } from "../config/test-config.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthFixtures {
  /** Page pre-authenticated as the tenant owner. Navigated to / on setup. */
  tenantPage: Page;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs in via the UI form and waits until the authenticated app shell is visible.
 *
 * The tenant sign-in is two-step:
 * 1. Fill email + password → click "Continue"
 * 2. If multiple tenants appear, click the matching tenant card
 *    (identified by data-testid="tenant-picker-{tenantKey}").
 *
 * Used by global-setup to pre-authenticate and persist browser storage state.
 */
export async function signInAsTenantOwner(page: Page): Promise<void> {
  const tenantOwner = TEST_CONFIG.TENANT_OWNER;
  if (!tenantOwner) {
    throw new Error("TEST_CONFIG.TENANT_OWNER is undefined");
  }
  const { email, password, tenantKey } = tenantOwner;

  await page.goto(TEST_CONFIG.ROUTES.SIGN_IN);
  await page.waitForLoadState("networkidle");

  // Step 1 — credentials
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 2 — tenant picker (only shown when user belongs to multiple tenants).
  // Each workspace card has data-testid="tenant-picker-{tenantKey}".
  const tenantCard = page.locator(`[data-testid="tenant-picker-${tenantKey}"]`);
  const hasPicker = await tenantCard
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (hasPicker) {
    await tenantCard.click();
  }

  // Wait for a URL that is NOT the sign-in page — this ensures we don't match
  // prematurely while still on the credentials or tenant-picker step
  // (the old "**/**" pattern matched /sign-in too since it contains "/").
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: TEST_CONFIG.NAVIGATION_TIMEOUT,
  });

  // Confirm the authenticated app shell has rendered
  await expect(page.locator("[data-testid='app-layout']")).toBeVisible({
    timeout: TEST_CONFIG.DEFAULT_TIMEOUT,
  });
}

/**
 * Navigates to / and falls back to a fresh sign-in if the stored session
 * has expired (route guard redirects to /sign-in).
 *
 * After this call the page is guaranteed to be on the dashboard with
 * the app-layout visible.
 */
export async function restoreTenantSession(page: Page): Promise<void> {
  await page.goto(TEST_CONFIG.ROUTES.HOME);
  await page.waitForLoadState("networkidle");

  if (page.url().includes(TEST_CONFIG.ROUTES.SIGN_IN)) {
    await signInAsTenantOwner(page);
    return;
  }

  // Session still valid — confirm the app shell is visible
  await expect(page.locator("[data-testid='app-layout']")).toBeVisible({
    timeout: TEST_CONFIG.DEFAULT_TIMEOUT,
  });
}

// ─── Extended test fixture ────────────────────────────────────────────────────

/**
 * Extended Playwright `test` that provides a `tenantPage` fixture.
 *
 * Reuses the storage state saved by global-setup so no per-test sign-in
 * network call is needed. Falls back to a fresh sign-in if the session
 * has expired (tokens are in sessionStorage which is not saved in the
 * storage state file — global-setup calls signInAsTenantOwner and saves
 * localStorage/cookies; the refresh token in sessionStorage requires a
 * fresh sign-in on each new browser context).
 *
 * Usage:
 * ```ts
 * import { test, expect } from "../fixtures";
 *
 * test("dashboard loads", async ({ tenantPage }) => {
 *   await expect(tenantPage.locator("[data-testid='app-layout']")).toBeVisible();
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  tenantPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_CONFIG.STORAGE_STATE,
    });
    const page = await context.newPage();
    await restoreTenantSession(page);
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
