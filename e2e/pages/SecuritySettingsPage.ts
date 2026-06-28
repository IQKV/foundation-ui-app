import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";

/**
 * Page Object for the Security Settings page (/settings/security).
 *
 * Covers:
 *   - Roles section
 *   - Password section (change password inline form)
 *   - Change Password modal
 */
export class SecuritySettingsPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(ROUTES.SETTINGS_SECURITY);
    await this.pageRoot.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  // ─── Page-level locators ──────────────────────────────────────────────────

  get pageRoot(): Locator {
    return this.page.locator(byTestId(TestSelectors.SECURITY_SETTINGS_PAGE));
  }

  get rolesSection(): Locator {
    return this.page.locator(byTestId(TestSelectors.SECURITY_SETTINGS_ROLES_SECTION));
  }

  get passwordSection(): Locator {
    return this.page.locator(byTestId(TestSelectors.SECURITY_SETTINGS_PASSWORD_SECTION));
  }

  get changePasswordButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SECURITY_SETTINGS_CHANGE_PASSWORD_BUTTON));
  }

  // ─── Change Password modal locators ──────────────────────────────────────

  get changePasswordModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_MODAL));
  }

  get changePasswordForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_FORM));
  }

  get currentPasswordInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_CURRENT_INPUT));
  }

  get newPasswordInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_NEW_INPUT));
  }

  get confirmPasswordInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_CONFIRM_INPUT));
  }

  get passwordRequirements(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_REQUIREMENTS));
  }

  get changePasswordConfirmButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_CONFIRM_BUTTON));
  }

  get changePasswordCancelButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.CHANGE_PASSWORD_CANCEL_BUTTON));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async openChangePasswordModal() {
    await this.changePasswordButton.click();
    await this.changePasswordModal.waitFor({ state: "visible", timeout: TIMEOUTS.DEFAULT });
  }

  async fillChangePasswordForm(data: { current: string; newPassword: string; confirm: string }) {
    await this.currentPasswordInput.fill(data.current);
    await this.newPasswordInput.fill(data.newPassword);
    await this.confirmPasswordInput.fill(data.confirm);
  }

  async submitChangePassword() {
    await this.changePasswordConfirmButton.click();
  }

  async cancelChangePassword() {
    await this.changePasswordCancelButton.click();
    await this.changePasswordModal.waitFor({ state: "hidden", timeout: TIMEOUTS.DEFAULT });
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.pageRoot).toBeVisible();
    await expect(this.rolesSection).toBeVisible();
    await expect(this.passwordSection).toBeVisible();
  }

  async expectChangePasswordModalVisible() {
    await expect(this.changePasswordModal).toBeVisible();
    await expect(this.changePasswordForm).toBeVisible();
    await expect(this.currentPasswordInput).toBeVisible();
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
  }

  async expectChangePasswordModalHidden() {
    await expect(this.changePasswordModal).toBeHidden();
  }
}
