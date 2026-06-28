import { expect } from "@playwright/test";
import { test } from "../../fixtures/index.js";
import { GeneralSettingsPage } from "../../pages/index.js";
import { ROUTES } from "../../config/routes.js";
import { TIMEOUTS } from "../../config/timeouts.js";

test.describe("General Settings Page", () => {
  let settings: GeneralSettingsPage;

  test.beforeEach(async ({ tenantPage }) => {
    settings = new GeneralSettingsPage(tenantPage);
    await settings.goto();
  });

  test("page renders all core sections", async () => {
    await settings.expectPageVisible();
  });

  test("profile form fields are visible and populated", async () => {
    await settings.waitForProfileFormReady();
    await settings.expectProfileFormVisible();
    await expect(settings.emailInput).toBeVisible();
  });

  test("avatar section is visible", async () => {
    await expect(settings.avatarSection).toBeVisible();
  });

  test("organisations section is visible", async () => {
    await settings.expectOrganizationsSectionVisible();
  });

  test("first name input accepts new value", async () => {
    await settings.waitForProfileFormReady();

    const current = await settings.firstNameInput.inputValue();
    await settings.firstNameInput.clear();
    await settings.firstNameInput.fill("UpdatedName");
    await expect(settings.firstNameInput).toHaveValue("UpdatedName");

    // Restore original value so test isolation is maintained
    await settings.firstNameInput.clear();
    await settings.firstNameInput.fill(current);
  });

  test("save button is visible and enabled", async () => {
    await settings.waitForProfileFormReady();
    await expect(settings.saveButton).toBeVisible();
    await expect(settings.saveButton).toBeEnabled();
  });

  test("navigating directly to /settings/general works when authenticated", async ({
    tenantPage,
  }) => {
    await tenantPage.goto(ROUTES.SETTINGS_GENERAL);
    await expect(settings.pageRoot).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
  });
});
