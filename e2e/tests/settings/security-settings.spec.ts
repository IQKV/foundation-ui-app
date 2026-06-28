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

  test("change-password button is visible", async () => {
    await expect(security.changePasswordButton).toBeVisible();
  });

  test("change-password modal opens on button click", async () => {
    await security.openChangePasswordModal();
    await security.expectChangePasswordModalVisible();
  });

  test("change-password modal closes on cancel", async () => {
    await security.openChangePasswordModal();
    await security.cancelChangePassword();
    await security.expectChangePasswordModalHidden();
  });

  test("change-password form inputs are all present", async () => {
    await security.openChangePasswordModal();
    await expect(security.currentPasswordInput).toBeVisible();
    await expect(security.newPasswordInput).toBeVisible();
    await expect(security.confirmPasswordInput).toBeVisible();
    await expect(security.changePasswordConfirmButton).toBeVisible();
    await expect(security.changePasswordCancelButton).toBeVisible();
  });

  test("password fields mask input", async () => {
    await security.openChangePasswordModal();
    await expect(security.currentPasswordInput).toHaveAttribute("type", "password");
    await expect(security.newPasswordInput).toHaveAttribute("type", "password");
    await expect(security.confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("navigating directly to /settings/security works when authenticated", async ({
    tenantPage,
  }) => {
    await tenantPage.goto(ROUTES.SETTINGS_SECURITY);
    await expect(security.pageRoot).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
  });
});
