import { test, expect } from "@playwright/test";
import { AppPage, testUtils } from "./utils/test-helpers.js";
import { TestSelectors, byTestId } from "./utils/test-selectors.js";

/**
 * Unauthenticated smoke tests — these use a plain `{ page }` with no stored
 * session so navigation to "/" redirects to the sign-in page.
 */
test.describe("App Smoke Tests", () => {
  test("sign-in page loads on unauthenticated visit to /", async ({ page }) => {
    const app = new AppPage(page);
    await app.goToHome();
    // Unauthenticated "/" is guarded — expect redirect to /sign-in
    await expect(page).toHaveURL(/sign-in/);
    await expect(page.locator(byTestId(TestSelectors.AUTH_LAYOUT))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.SIGN_IN_FORM))).toBeVisible();
  });

  test("sign-in form has correct inputs and submit button", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(byTestId(TestSelectors.SIGN_IN_FORM))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.SIGN_IN_EMAIL_INPUT))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.SIGN_IN_PASSWORD_INPUT))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.SIGN_IN_SUBMIT_BUTTON))).toBeVisible();
  });

  test("404 page loads with correct testids", async ({ page }) => {
    const app = new AppPage(page);
    await app.goTo404();
    await app.expect404PageVisible();
    await testUtils.expectVisibleByTestId(page, TestSelectors.PAGE_404);
    await testUtils.expectVisibleByTestId(page, TestSelectors.BUTTON("go-home"));
  });

  test("404 go-home button navigates to app root (redirects to sign-in)", async ({ page }) => {
    await page.goto("/404");
    await page.waitForLoadState("networkidle");
    await page.locator(byTestId(TestSelectors.BUTTON("go-home"))).click();
    // Unauthenticated visit to "/" redirects to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("react root is rendered", async ({ page }) => {
    await page.goto("/");
    await testUtils.waitForPageReady(page);
    await expect(page.locator("#root")).toBeAttached();
  });

  test("essential meta tags are present", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator('meta[name="viewport"]').count()).toBeGreaterThan(0);
  });

  test("app has no uncaught JS exceptions on load", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto("/");
    await testUtils.waitForPageReady(page);
    expect(pageErrors).toHaveLength(0);
  });

  test("app has no critical console errors on load", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.goto("/");
    await testUtils.waitForPageReady(page);

    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes("Failed to load resource") && !e.includes("NetworkError"),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("error boundary is not visible on normal page load", async ({ page }) => {
    await page.goto("/");
    await testUtils.waitForPageReady(page);
    await expect(page.locator(byTestId(TestSelectors.ERROR_BOUNDARY))).toBeHidden();
  });

  test("loading overlay is hidden after page loads", async ({ page }) => {
    await page.goto("/");
    await testUtils.waitForPageReady(page);
    await expect(page.locator(byTestId(TestSelectors.LOADING_OVERLAY))).toBeHidden();
  });

  test("auth layout is present on sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(byTestId(TestSelectors.AUTH_LAYOUT))).toBeVisible();
  });

  test("locale switcher is present on sign-in page", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(byTestId(TestSelectors.LOCALE_SWITCHER))).toBeVisible();
  });
});
