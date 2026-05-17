import { test as base, expect, type Page } from "@playwright/test";
import { TEST_CONFIG } from "../config/test-config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthFixtures {
  /** Page pre-authenticated as the tenant owner. Navigated to / on setup. */
  tenantPage: Page;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Signs in via the UI form and waits until the app home page is visible.
 *
 * The tenant sign-in is two-step:
 * 1. Fill email + password → click "Continue"
 * 2. If the user belongs to a single tenant the app signs in automatically.
 *    If multiple tenants appear, click the matching tenant card.
 *
 * Used by global-setup to pre-authenticate and persist browser storage state.
 */
export async function signInAsTenantOwner(page: Page): Promise<void> {
  const { email, password, tenantKey } = TEST_CONFIG.TENANT_OWNER;

  await page.goto(TEST_CONFIG.ROUTES.SIGN_IN);
  await page.waitForLoadState("networkidle");

  // Step 1 — credentials
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 2 — tenant picker (only shown when user belongs to multiple tenants).
  // Wait briefly; if a tenant card for our tenant appears, click it.
  const tenantCard = page.getByText(tenantKey, { exact: false });
  const hasPicker = await tenantCard
    .waitFor({ state: "visible", timeout: 3_000 })
    .then(() => true)
    .catch(() => false);

  if (hasPicker) {
    await tenantCard.click();
  }

  // Wait for successful navigation to the app home
  await page.waitForURL(`**${TEST_CONFIG.ROUTES.HOME}**`, {
    timeout: TEST_CONFIG.NAVIGATION_TIMEOUT,
  });

  await expect(page.locator("#root")).toBeVisible({
    timeout: TEST_CONFIG.DEFAULT_TIMEOUT,
  });
}

/**
 * Navigates to / and falls back to a fresh sign-in if the stored session
 * has expired (route guard redirects to /sign-in).
 */
export async function restoreTenantSession(page: Page): Promise<void> {
  await page.goto(TEST_CONFIG.ROUTES.HOME);
  await page.waitForLoadState("networkidle");

  if (page.url().includes(TEST_CONFIG.ROUTES.SIGN_IN)) {
    await signInAsTenantOwner(page);
  }
}

// ─── Extended test fixture ────────────────────────────────────────────────────

/**
 * Extended Playwright `test` that provides a `tenantPage` fixture.
 *
 * Reuses the storage state saved by global-setup so no per-test sign-in
 * network call is needed. Falls back to a fresh sign-in if the session
 * has expired.
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
