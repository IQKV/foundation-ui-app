import { test } from "@playwright/test";
import { test as authTest } from "../../fixtures/index.js";
import { checkA11y } from "../../lib/a11y.js";
import { TestSelectors, byTestId } from "../../lib/test-selectors.js";
import { ROUTES } from "../../config/routes.js";

/**
 * Accessibility tests using axe-core.
 *
 * These are structural checks — they catch missing ARIA roles, colour
 * contrast failures, missing form labels, keyboard-trap patterns, etc.
 * They do NOT replace manual testing with assistive technologies.
 *
 * Unauthenticated pages use the plain `test` fixture.
 * Authenticated pages use the `authTest` fixture (tenantPage).
 */

// ─── Unauthenticated pages ────────────────────────────────────────────────────

test.describe("A11y — Unauthenticated pages", () => {
  test("sign-in page has no violations", async ({ page }) => {
    await page.goto(ROUTES.SIGN_IN);
    await page.locator(byTestId(TestSelectors.SIGN_IN_FORM)).waitFor({ state: "visible" });
    await checkA11y(page);
  });

  test("404 error page has no violations", async ({ page }) => {
    await page.goto(ROUTES.NOT_FOUND);
    await page.locator(byTestId(TestSelectors.PAGE_404)).waitFor({ state: "visible" });
    await checkA11y(page);
  });

  test("500 error page has no violations", async ({ page }) => {
    await page.goto(ROUTES.SERVER_ERROR);
    await page.locator(byTestId(TestSelectors.PAGE_500)).waitFor({ state: "visible" });
    await checkA11y(page);
  });
});

// ─── Authenticated pages ──────────────────────────────────────────────────────

authTest.describe("A11y — Authenticated pages", () => {
  authTest("app shell (dashboard) has no violations", async ({ tenantPage }) => {
    await checkA11y(tenantPage);
  });

  authTest("header has no violations", async ({ tenantPage }) => {
    await checkA11y(tenantPage, {
      include: byTestId(TestSelectors.APP_HEADER),
    });
  });

  authTest("navigation has no violations", async ({ tenantPage }) => {
    await checkA11y(tenantPage, {
      include: byTestId(TestSelectors.APP_NAV),
    });
  });

  authTest("general settings page has no violations", async ({ tenantPage }) => {
    await tenantPage.goto(ROUTES.SETTINGS_GENERAL);
    await tenantPage
      .locator(byTestId(TestSelectors.GENERAL_SETTINGS_PAGE))
      .waitFor({ state: "visible" });
    await checkA11y(tenantPage);
  });

  authTest("security settings page has no violations", async ({ tenantPage }) => {
    await tenantPage.goto(ROUTES.SETTINGS_SECURITY);
    await tenantPage
      .locator(byTestId(TestSelectors.SECURITY_SETTINGS_PAGE))
      .waitFor({ state: "visible" });
    await checkA11y(tenantPage);
  });

  authTest("organisation settings page has no violations", async ({ tenantPage }) => {
    await tenantPage.goto(ROUTES.SETTINGS_ORGANIZATION);
    await tenantPage
      .locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_PAGE))
      .waitFor({ state: "visible" });
    await checkA11y(tenantPage);
  });

  authTest("user menu has no violations when open", async ({ tenantPage }) => {
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await tenantPage
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });
    await checkA11y(tenantPage, {
      include: byTestId(TestSelectors.HEADER_USER_MENU),
    });
  });
});
