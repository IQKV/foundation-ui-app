import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";

/**
 * Page Object for the Organization Settings page (/settings/organization).
 *
 * The page shows a table of the user's organization memberships with search
 * and refresh controls. Tenant owners see an "Edit" button per row that
 * switches into the target workspace.
 *
 * Covers:
 *   - Org memberships table
 *   - Search and refresh controls
 *   - Member action menus (change role, ban, remove, transfer ownership)
 *   - Send Invitation modal
 *   - Invitation Details modal
 */
export class OrgSettingsPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(ROUTES.SETTINGS_ORGANIZATION);
    await this.pageRoot.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  // ─── Page-level locators ──────────────────────────────────────────────────

  get pageRoot(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_PAGE));
  }

  get searchInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_PAGE_SEARCH_INPUT));
  }

  get refreshButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_PAGE_REFRESH_BUTTON));
  }

  get membersTable(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_PAGE_TABLE));
  }

  get createOrgButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_PAGE_CREATE_ORG_BUTTON));
  }

  // ─── Organization info form locators ─────────────────────────────────────
  // NOTE: The org settings page no longer has an inline edit form.
  // It shows a table of the user's organization memberships instead.
  // These locators are kept for backward compatibility but are not used by
  // any currently passing tests.

  get orgSettingsForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_FORM));
  }

  get orgNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_NAME_INPUT));
  }

  get orgKeyInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_KEY_INPUT));
  }

  get orgSaveButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_SAVE_BUTTON));
  }

  get orgStatusBadge(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_STATUS_BADGE));
  }

  get orgLoading(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_LOADING));
  }

  get orgError(): Locator {
    return this.page.locator(byTestId(TestSelectors.ORGANIZATION_SETTINGS_ERROR));
  }

  // ─── Member action locators ───────────────────────────────────────────────

  get memberActionsMenu(): Locator {
    return this.page.locator(byTestId(TestSelectors.MEMBER_ACTIONS_MENU));
  }

  get memberActionsMenuButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.MEMBER_ACTIONS_MENU_BUTTON));
  }

  get memberActionsDropdown(): Locator {
    return this.page.locator(byTestId(TestSelectors.MEMBER_ACTIONS_DROPDOWN));
  }

  // ─── Send Invitation modal locators ──────────────────────────────────────

  get sendInvitationModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.SEND_INVITATION_MODAL));
  }

  get sendInvitationEmailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SEND_INVITATION_EMAIL_INPUT));
  }

  get sendInvitationRoleSelect(): Locator {
    return this.page.locator(byTestId(TestSelectors.SEND_INVITATION_ROLE_SELECT));
  }

  get sendInvitationConfirmButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SEND_INVITATION_CONFIRM_BUTTON));
  }

  get sendInvitationCancelButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SEND_INVITATION_CANCEL_BUTTON));
  }

  // ─── Remove Member modal locators ─────────────────────────────────────────

  get removeMemberModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.REMOVE_MEMBER_MODAL));
  }

  get removeMemberConfirmButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.REMOVE_MEMBER_CONFIRM_BUTTON));
  }

  get removeMemberCancelButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.REMOVE_MEMBER_CANCEL_BUTTON));
  }

  // ─── Transfer Ownership modal locators ───────────────────────────────────

  get transferOwnershipModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.TRANSFER_OWNERSHIP_MODAL));
  }

  get transferOwnershipConfirmButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.TRANSFER_OWNERSHIP_CONFIRM_BUTTON));
  }

  get transferOwnershipCancelButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.TRANSFER_OWNERSHIP_CANCEL_BUTTON));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async openMemberActionsMenu() {
    await this.memberActionsMenuButton.click();
    await this.memberActionsDropdown.waitFor({ state: "visible", timeout: TIMEOUTS.DEFAULT });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.pageRoot).toBeVisible();
  }

  async expectMembersTableVisible() {
    await expect(this.membersTable).toBeVisible({ timeout: TIMEOUTS.SLOW });
  }

  async expectSendInvitationModalVisible() {
    await expect(this.sendInvitationModal).toBeVisible();
    await expect(this.sendInvitationEmailInput).toBeVisible();
  }

  async expectSendInvitationModalHidden() {
    await expect(this.sendInvitationModal).toBeHidden();
  }
}
