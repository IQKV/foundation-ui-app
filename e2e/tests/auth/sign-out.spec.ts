import { test, expect } from "../../fixtures/index.js";
import { TestSelectors, byTestId } from "../../lib/test-selectors.js";

/**
 * Sign-out flow tests — authenticated context (tenantPage fixture).
 */
test.describe("Sign-Out Flow", () => {
  test("sign-out button is accessible from the user menu", async ({ tenantPage }) => {
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await tenantPage
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });

    const signOutButton = tenantPage.locator(byTestId(TestSelectors.BUTTON("sign-out")));
    await expect(signOutButton).toBeVisible();
    await expect(signOutButton).toBeEnabled();
  });

  test("clicking sign-out navigates to sign-in page", async ({ tenantPage }) => {
    // Open user menu
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await tenantPage
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });

    // Click sign-out
    await tenantPage.locator(byTestId(TestSelectors.BUTTON("sign-out"))).click();

    // Should land on the sign-in page
    await expect(tenantPage).toHaveURL(/sign-in/, { timeout: 15_000 });
    await expect(tenantPage.locator(byTestId(TestSelectors.SIGN_IN_FORM))).toBeVisible();
  });

  test("after sign-out, navigating to / redirects to sign-in", async ({ tenantPage }) => {
    // Sign out first
    await tenantPage.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON)).click();
    await tenantPage
      .locator(byTestId(TestSelectors.HEADER_USER_MENU))
      .waitFor({ state: "visible" });
    await tenantPage.locator(byTestId(TestSelectors.BUTTON("sign-out"))).click();
    await expect(tenantPage).toHaveURL(/sign-in/, { timeout: 15_000 });

    // Now navigate directly to home — should redirect back to sign-in
    await tenantPage.goto("/");
    await expect(tenantPage).toHaveURL(/sign-in/);
    await expect(tenantPage.locator(byTestId(TestSelectors.SIGN_IN_FORM))).toBeVisible();
  });
});
