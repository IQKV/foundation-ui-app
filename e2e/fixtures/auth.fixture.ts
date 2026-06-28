import { test as base, expect, type Page } from "@playwright/test";
import { AUTH_CONFIG } from "../config/auth.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";

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
  const { email, password, tenantKey } = AUTH_CONFIG.TENANT_OWNER;

  await page.goto(ROUTES.SIGN_IN);

  // Wait for the sign-in form to be visible before interacting
  await page.locator(byTestId(TestSelectors.SIGN_IN_FORM)).waitFor({
    state: "visible",
    timeout: TIMEOUTS.NAVIGATION,
  });

  // Step 1 — credentials
  await page.locator(byTestId(TestSelectors.SIGN_IN_EMAIL_INPUT)).fill(email);
  await page.locator(byTestId(TestSelectors.SIGN_IN_PASSWORD_INPUT)).fill(password);
  await page.locator(byTestId(TestSelectors.SIGN_IN_SUBMIT_BUTTON)).click();

  // Step 2 — tenant picker (only shown when user belongs to multiple tenants).
  // Each workspace card has data-testid="tenant-picker-{tenantKey}".
  const tenantCard = page.locator(byTestId(TestSelectors.SIGN_IN_TENANT_PICKER_TENANT(tenantKey)));
  const hasPicker = await tenantCard
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (hasPicker) {
    await tenantCard.click();
  }

  // Wait for a URL that is NOT the sign-in page — ensures we don't match
  // prematurely while still on the credentials or tenant-picker step.
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: TIMEOUTS.NAVIGATION,
  });

  // Confirm the authenticated app shell has rendered
  await expect(page.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible({
    timeout: TIMEOUTS.DEFAULT,
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
  await page.goto(ROUTES.HOME);

  // Wait for either the app shell or the sign-in redirect
  const appLayout = page.locator(byTestId(TestSelectors.APP_LAYOUT));
  const signInForm = page.locator(byTestId(TestSelectors.SIGN_IN_FORM));

  const landed = await Promise.race([
    appLayout.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION }).then(() => "app"),
    signInForm.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION }).then(() => "signin"),
  ]).catch(() => "timeout");

  if (landed === "signin") {
    await signInAsTenantOwner(page);
    return;
  }

  if (landed === "timeout") {
    throw new Error("restoreTenantSession: neither app-layout nor sign-in form appeared in time");
  }

  // Session still valid — app shell is already visible
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
      storageState: AUTH_CONFIG.STORAGE_STATE,
    });
    const page = await context.newPage();
    await restoreTenantSession(page);
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
