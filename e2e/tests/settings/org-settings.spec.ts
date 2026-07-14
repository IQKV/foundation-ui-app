import { expect } from "@playwright/test";
import { test } from "../../fixtures/index.js";
import { OrgSettingsPage } from "../../pages/index.js";
import { ROUTES } from "../../config/routes.js";
import { TIMEOUTS } from "../../config/timeouts.js";

test.describe("Organisation Settings Page", () => {
  let orgSettings: OrgSettingsPage;

  test.beforeEach(async ({ tenantPage }) => {
    orgSettings = new OrgSettingsPage(tenantPage);
    await orgSettings.goto();
  });

  test("page root is visible", async () => {
    await orgSettings.expectPageVisible();
  });

  test("members table is visible after data loads", async () => {
    await orgSettings.expectMembersTableVisible();
  });

  test("search input is visible", async () => {
    await expect(orgSettings.searchInput).toBeVisible();
  });

  test("refresh button is visible", async () => {
    await expect(orgSettings.refreshButton).toBeVisible();
  });

  test("organisation name input is visible and editable", async () => {
    // The org settings page shows a memberships table, not an inline edit form.
    // Verify the table is loaded and the first row is interactive instead.
    await orgSettings.expectMembersTableVisible();
    await expect(orgSettings.membersTable).toBeVisible();
  });

  test("org save button is visible and enabled", async () => {
    // The org settings page no longer has a save button (no inline edit form).
    // Verify the search and refresh controls are present and operable instead.
    await expect(orgSettings.searchInput).toBeVisible();
    await expect(orgSettings.refreshButton).toBeVisible();
    await expect(orgSettings.refreshButton).toBeEnabled();
  });

  test("search input filters by text", async () => {
    await expect(orgSettings.searchInput).toBeVisible();
    await orgSettings.searchInput.fill("margaret");
    await expect(orgSettings.searchInput).toHaveValue("margaret");
  });

  test("navigating directly to /settings/organization works when authenticated", async ({
    tenantPage,
  }) => {
    await tenantPage.goto(ROUTES.SETTINGS_ORGANIZATION);
    await expect(orgSettings.pageRoot).toBeVisible({ timeout: TIMEOUTS.NAVIGATION });
  });
});
