import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";

/**
 * Page Object for the Security Settings page (/settings/security).
 *
 * The page renders:
 *   - Connected Accounts section (OAuth2 providers)
 *   - Tenant SSO section (tenant owner only)
 *   - Roles section
 *   - Password section — inline change-password form (no modal)
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

  // ─── Inline change-password form locators ────────────────────────────────
  // The change-password form is rendered inline inside the Password section.
  // There is no modal — the fields and submit button live directly on the page.
  //
  // Mantine's PasswordInput puts data-testid on the outer wrapper div, not
  // the <input> itself. Scoping to `input` inside the wrapper gives us the
  // real <input type="password"> for attribute checks and fill() calls.

  get currentPasswordInput(): Locator {
    return this.page
      .locator(byTestId(TestSelectors.SECURITY_SETTINGS_CURRENT_PASSWORD_INPUT))
      .locator("input");
  }

  get newPasswordInput(): Locator {
    return this.page
      .locator(byTestId(TestSelectors.SECURITY_SETTINGS_NEW_PASSWORD_INPUT))
      .locator("input");
  }

  get confirmPasswordInput(): Locator {
    return this.page
      .locator(byTestId(TestSelectors.SECURITY_SETTINGS_CONFIRM_PASSWORD_INPUT))
      .locator("input");
  }

  /** Submit button for the inline change-password form. */
  get changePasswordButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SECURITY_SETTINGS_CHANGE_PASSWORD_BUTTON));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async fillChangePasswordForm(data: { current: string; newPassword: string; confirm: string }) {
    await this.currentPasswordInput.fill(data.current);
    await this.newPasswordInput.fill(data.newPassword);
    await this.confirmPasswordInput.fill(data.confirm);
  }

  async submitChangePassword() {
    await this.changePasswordButton.click();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.pageRoot).toBeVisible();
    await expect(this.rolesSection).toBeVisible();
    await expect(this.passwordSection).toBeVisible();
  }

  async expectPasswordFormVisible() {
    await expect(this.currentPasswordInput).toBeVisible();
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.changePasswordButton).toBeVisible();
  }
}
