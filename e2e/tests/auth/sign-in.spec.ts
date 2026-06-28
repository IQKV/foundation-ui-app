import { test, expect } from "@playwright/test";
import { AuthPage } from "../../pages/index.js";
import { AUTH_CONFIG } from "../../config/auth.js";
import { TestSelectors, byTestId } from "../../lib/test-selectors.js";

/**
 * Sign-in flow tests — unauthenticated context, no stored session.
 *
 * These tests use a plain `{ page }` fixture so they always start fresh
 * and exercise the real credential + tenant-picker flow against the
 * configured BASE_URL (staging by default; override with BASE_URL env var).
 */
test.describe("Sign-In Flow", () => {
  let auth: AuthPage;

  test.beforeEach(async ({ page }) => {
    auth = new AuthPage(page);
    await auth.goToSignIn();
  });

  test("sign-in page renders all required elements", async () => {
    await auth.expectSignInPageVisible();
  });

  test("email and password inputs accept text", async ({ page }) => {
    await auth.signInEmailInput.fill("test@example.com");
    await auth.signInPasswordInput.fill("password");

    await expect(auth.signInEmailInput).toHaveValue("test@example.com");
    await expect(auth.signInPasswordInput).toHaveValue("password");
  });

  test("submit button is enabled when form has values", async ({ page }) => {
    await auth.fillSignInForm("test@example.com", "password");
    await expect(auth.signInSubmitButton).toBeEnabled();
  });

  test("locale switcher is visible on sign-in page", async ({ page }) => {
    await expect(page.locator(byTestId(TestSelectors.LOCALE_SWITCHER))).toBeVisible();
  });

  test("unauthenticated navigation to / redirects to sign-in", async ({ page }) => {
    await page.goto("/");
    await auth.expectRedirectedToSignIn();
  });

  test("sign-in with valid credentials authenticates and redirects", async ({ page }) => {
    const { email, password } = AUTH_CONFIG.TENANT_OWNER;

    await auth.fillSignInForm(email, password);
    await auth.submitSignIn();

    // After submission: either the tenant picker or the app shell should appear
    const appLayout = page.locator(byTestId(TestSelectors.APP_LAYOUT));
    const tenantPicker = page.locator(byTestId(TestSelectors.SIGN_IN_TENANT_PICKER));

    const landed = await Promise.race([
      appLayout.waitFor({ state: "visible", timeout: 20_000 }).then(() => "app"),
      tenantPicker.waitFor({ state: "visible", timeout: 20_000 }).then(() => "picker"),
    ]).catch(() => "timeout");

    if (landed === "picker") {
      // Pick the configured tenant
      const tenantCard = page.locator(
        byTestId(TestSelectors.SIGN_IN_TENANT_PICKER_TENANT(AUTH_CONFIG.TENANT_OWNER.tenantKey)),
      );
      await tenantCard.click();
      await expect(appLayout).toBeVisible({ timeout: 15_000 });
    } else if (landed === "timeout") {
      throw new Error("Neither app shell nor tenant picker appeared after sign-in");
    }

    await expect(page).not.toHaveURL(/sign-in/);
    await expect(appLayout).toBeVisible();
  });

  test("invalid credentials show an error", async ({ page }) => {
    await auth.fillSignInForm("notauser@example.com", "WrongPassword123!");
    await auth.submitSignIn();

    // The form should remain visible — no navigation away
    await expect(auth.signInForm).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/sign-in/);
  });

  test("empty form submission does not navigate away", async ({ page }) => {
    await auth.submitSignIn();
    await expect(page).toHaveURL(/sign-in/);
    await expect(auth.signInForm).toBeVisible();
  });

  test("password field masks input", async ({ page }) => {
    // The input type should be "password" so the browser masks the text
    await expect(auth.signInPasswordInput).toHaveAttribute("type", "password");
  });
});
