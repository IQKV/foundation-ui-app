import { test, expect } from "@playwright/test";
import { AuthPage } from "../../pages/index.js";
import { TestSelectors, byTestId } from "../../lib/test-selectors.js";
import { TIMEOUTS } from "../../config/timeouts.js";

/**
 * Forgot-password / reset-password flow tests — unauthenticated context.
 */
test.describe("Forgot Password Flow", () => {
  let auth: AuthPage;

  test.beforeEach(async ({ page }) => {
    auth = new AuthPage(page);
    await auth.goToForgotPassword();
  });

  test("forgot-password page renders correctly", async () => {
    await auth.expectForgotPasswordPageVisible();
    await expect(auth.forgotPasswordEmailInput).toBeVisible();
    await expect(auth.forgotPasswordSubmitButton).toBeVisible();
  });

  test("sign-in link navigates back to sign-in", async ({ page }) => {
    await auth.forgotPasswordSignInLink.click();
    await expect(page).toHaveURL(/sign-in/);
    await expect(auth.signInForm).toBeVisible();
  });

  test("submitting a valid email shows success state", async ({ page }) => {
    await auth.fillForgotPasswordForm("margaret.hayes@demo.iqkv.com");
    await auth.submitForgotPassword();

    // The API always returns 200 — success state should render
    await expect(auth.forgotPasswordSuccess).toBeVisible({ timeout: TIMEOUTS.SLOW });
  });

  test("submit button is disabled while request is pending", async ({ page }) => {
    await auth.fillForgotPasswordForm("margaret.hayes@demo.iqkv.com");
    // Intercept to delay response
    await page.route("**/v1/iam/users/password/forgot", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await route.continue();
    });

    await auth.submitForgotPassword();

    // Button should be in loading/disabled state during submission
    await expect(auth.forgotPasswordSubmitButton).toBeDisabled({ timeout: 2_000 });
  });

  test("empty email does not submit", async ({ page }) => {
    await auth.submitForgotPassword();
    // Should remain on the same page without showing success
    await expect(auth.forgotPasswordForm).toBeVisible();
    await expect(auth.forgotPasswordSuccess).toBeHidden();
  });
});

test.describe("Reset Password — No Token", () => {
  test("reset-password page without token shows error state", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goToResetPassword(); // no token
    await expect(auth.resetPasswordNoToken).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
  });
});
