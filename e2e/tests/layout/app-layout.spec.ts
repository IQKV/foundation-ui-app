import { expect } from "@playwright/test";
import { test } from "../../fixtures/index.js";
import { TestSelectors, byTestId } from "../../lib/test-selectors.js";

/**
 * Authenticated layout tests.
 *
 * All tests use the `tenantPage` fixture (tenant owner signed in).
 * The fixture already calls restoreTenantSession during setup, so each
 * test starts on the dashboard with the app shell visible — no beforeEach needed.
 *
 * The dashboard lives at "/" (TanStack route /_app/), NOT "/dashboard".
 */
test.describe("App Layout E2E Tests", () => {
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

    // Read the current scheme so we can assert it flipped
    const htmlEl = tenantPage.locator("html");
    const before = await htmlEl.getAttribute("data-mantine-color-scheme");

    await toggle.click();

    // Wait for Mantine to apply the new scheme attribute instead of sleeping
    await expect(htmlEl).not.toHaveAttribute("data-mantine-color-scheme", before ?? "");
    await expect(toggle).toBeVisible();
  });

  test("user menu opens and displays options", async ({ tenantPage }) => {
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    // Scope to the dropdown so Mantine's portal doesn't cause false negatives
    const menu = tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU));
    await menu.waitFor({ state: "visible" });

    // Profile link is always present
    await expect(
      menu.locator(byTestId(TestSelectors.HEADER_USER_MENU_PROFILE_BUTTON)),
    ).toBeVisible();
    // Sign-out is always present
    await expect(menu.locator(byTestId(TestSelectors.BUTTON("sign-out")))).toBeVisible();
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

      const mobileToggle = tenantPage.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE));

      // Wait for Mantine's CSS breakpoint to apply rather than sleeping
      if (mobile) {
        await expect(mobileToggle).toBeVisible();
      } else {
        await expect(mobileToggle).toBeHidden();
      }

      await expect(tenantPage.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible();
      await expect(tenantPage.locator(byTestId(TestSelectors.APP_HEADER))).toBeVisible();
    }
  });
});

test.describe("Error Pages", () => {
  test("404 page renders with correct testids", async ({ tenantPage }) => {
    await tenantPage.goto("/404");
    await tenantPage.locator(byTestId(TestSelectors.PAGE_404)).waitFor({ state: "visible" });
    await expect(tenantPage.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(
      tenantPage.locator(byTestId(TestSelectors.ERROR_PAGE_GO_HOME_BUTTON)),
    ).toBeVisible();
  });

  test("500 page renders with correct testids", async ({ tenantPage }) => {
    await tenantPage.goto("/500");
    await tenantPage.locator(byTestId(TestSelectors.PAGE_500)).waitFor({ state: "visible" });
    await expect(tenantPage.locator(byTestId(TestSelectors.PAGE_500))).toBeVisible();
    await expect(
      tenantPage.locator(byTestId(TestSelectors.ERROR_PAGE_GO_HOME_BUTTON)),
    ).toBeVisible();
  });

  test("error boundary is not mounted when no render error has occurred", async ({
    tenantPage,
  }) => {
    // ErrorBoundary only renders its fallback (and the data-testid) when hasError=true.
    // When healthy the node is never in the DOM, so we assert it is not attached.
    await expect(tenantPage.locator(byTestId(TestSelectors.ERROR_BOUNDARY))).not.toBeAttached();
  });
});
