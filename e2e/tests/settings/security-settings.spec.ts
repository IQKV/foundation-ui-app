import { expect } from "@playwright/test";
import { test } from "../../fixtures/index.js";
import { SecuritySettingsPage } from "../../pages/index.js";
import { ROUTES } from "../../config/routes.js";
import { TIMEOUTS } from "../../config/timeouts.js";

test.describe("Security Settings Page", () => {
  let security: SecuritySettingsPage;

  test.beforeEach(async ({ tenantPage }) => {
    security = new SecuritySettingsPage(tenantPage);
    await security.goto();
  });

  test("page renders roles and password sections", async () => {
    await security.expectPageVisible();
  });

  test("inline change-password form fields are all present", async () => {
    await security.expectPasswordFormVisible();
  });

  test("password fields mask input", async () => {
    await expect(security.currentPasswordInput).toHaveAttribute("type", "password");
    await expect(security.newPasswordInput).toHaveAttribute("type", "password");
    await expect(security.confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("change-password submit button is visible and enabled", async () => {
    await expect(security.changePasswordButton).toBeVisible();
    await expect(security.changePasswordButton).toBeEnabled();
  });

  test("password inputs accept typed values", async () => {
    await security.currentPasswordInput.fill("OldPass1!");
    await security.newPasswordInput.fill("NewPass1!");
    await security.confirmPasswordInput.fill("NewPass1!");

    await expect(security.currentPasswordInput).toHaveValue("OldPass1!");
    await expect(security.newPasswordInput).toHaveValue("NewPass1!");
    await expect(security.confirmPasswordInput).toHaveValue("NewPass1!");
  });

  test("navigating directly to /settings/security works when authenticated", async ({
    tenantPage,
  }) => {
    await tenantPage.goto(ROUTES.SETTINGS_SECURITY);
    await expect(security.pageRoot).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
  });
});
