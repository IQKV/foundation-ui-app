import { expect } from "@playwright/test";
import { test } from "./fixtures/index.js";
import { TestSelectors, byTestId } from "./utils/test-selectors.js";
import { restoreTenantSession } from "./fixtures/auth.fixture.js";

/**
 * Authenticated layout tests.
 *
 * All tests use the `tenantPage` fixture (tenant owner signed in).
 * `restoreTenantSession` is called in beforeEach so the page is always
 * on the dashboard with the app shell visible before each test.
 *
 * The dashboard lives at "/" (TanStack route /_app/), NOT "/dashboard".
 */
test.describe("App Layout E2E Tests", () => {
  test.beforeEach(async ({ tenantPage }) => {
    await restoreTenantSession(tenantPage);
  });

  test("app layout loads with all key elements", async ({ tenantPage }) => {
    await expect(tenantPage.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible();
    await expect(tenantPage.locator(byTestId(TestSelectors.APP_HEADER))).toBeVisible();
    await expect(tenantPage.locator(byTestId(TestSelectors.APP_NAV))).toBeVisible();

    // Sidebar logo
    await expect(tenantPage.locator(byTestId(TestSelectors.HEADER_LOGO))).toBeVisible();

    // Header utility controls
    await expect(tenantPage.locator(byTestId(TestSelectors.LOCALE_SWITCHER))).toBeVisible();
    await expect(
      tenantPage.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE)),
    ).toBeVisible();
    await expect(tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON))).toBeVisible();

    // Mobile hamburger is hidden on desktop viewport
    await expect(
      tenantPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)),
    ).toBeHidden();
  });

  test("color scheme toggle works", async ({ tenantPage }) => {
    const toggle = tenantPage.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE));
    await expect(toggle).toBeVisible();
    await toggle.click();
    await tenantPage.waitForTimeout(300);
    await expect(toggle).toBeVisible();
  });

  test("user menu opens and displays options", async ({ tenantPage }) => {
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    // Mantine menu animates in
    await tenantPage
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });

    await expect(tenantPage.locator(byTestId(TestSelectors.BUTTON("profile")))).toBeVisible();
    await expect(tenantPage.locator(byTestId(TestSelectors.BUTTON("sign-out")))).toBeVisible();
  });

  test("sign out button is visible and enabled", async ({ tenantPage }) => {
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await tenantPage
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });

    const signOutButton = tenantPage.locator(byTestId(TestSelectors.BUTTON("sign-out")));
    await expect(signOutButton).toBeVisible();
    await expect(signOutButton).toBeEnabled();
  });

  test("mobile menu toggle appears on small screens", async ({ tenantPage }) => {
    // Mantine uses CSS media queries — resize is enough; no reload required
    await tenantPage.setViewportSize({ width: 375, height: 667 });
    await expect(
      tenantPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)),
    ).toBeVisible();

    await tenantPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE)).click();
    await expect(tenantPage.locator(byTestId(TestSelectors.APP_NAV))).toBeVisible();
  });

  test("error boundary is hidden by default", async ({ tenantPage }) => {
    await expect(tenantPage.locator(byTestId(TestSelectors.ERROR_BOUNDARY))).toBeHidden();
  });

  test("loading overlay is hidden after page loads", async ({ tenantPage }) => {
    await expect(tenantPage.locator(byTestId(TestSelectors.LOADING_OVERLAY))).toBeHidden();
  });

  test("app is accessible with keyboard navigation", async ({ tenantPage }) => {
    await tenantPage.locator("body").click();
    await tenantPage.keyboard.press("Tab");

    const hasFocus = await tenantPage.evaluate(
      () => document.activeElement !== null && document.activeElement !== document.body,
    );
    expect(hasFocus).toBe(true);
  });

  test("responsive layout across breakpoints", async ({ tenantPage }) => {
    const viewports = [
      { width: 375, height: 667, mobile: true },
      { width: 768, height: 1024, mobile: false },
      { width: 1024, height: 768, mobile: false },
      { width: 1920, height: 1080, mobile: false },
    ];

    for (const { width, height, mobile } of viewports) {
      await tenantPage.setViewportSize({ width, height });
      await tenantPage.waitForTimeout(150);

      await expect(tenantPage.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible();
      await expect(tenantPage.locator(byTestId(TestSelectors.APP_HEADER))).toBeVisible();

      const mobileToggle = tenantPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE));
      if (mobile) {
        await expect(mobileToggle).toBeVisible();
      } else {
        await expect(mobileToggle).toBeHidden();
      }
    }
  });
});

test.describe("Error Pages", () => {
  test("404 page renders with correct testids", async ({ tenantPage }) => {
    await tenantPage.goto("/404");
    await tenantPage.waitForLoadState("networkidle");

    await expect(tenantPage.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(tenantPage.locator(byTestId(TestSelectors.BUTTON("go-home")))).toBeVisible();
  });

  test("500 page renders with correct testids", async ({ tenantPage }) => {
    await tenantPage.goto("/500");
    await tenantPage.waitForLoadState("networkidle");

    await expect(tenantPage.locator(byTestId(TestSelectors.PAGE_500))).toBeVisible();
    await expect(tenantPage.locator(byTestId(TestSelectors.BUTTON("go-home")))).toBeVisible();
  });

  test("error boundary is hidden when no render error has occurred", async ({ tenantPage }) => {
    await expect(tenantPage.locator(byTestId(TestSelectors.ERROR_BOUNDARY))).toBeHidden();
  });
});
