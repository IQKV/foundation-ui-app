import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";

/**
 * Page Object for the General Settings page (/settings/general).
 *
 * Covers:
 *   - Profile form (first name, last name, email, locale)
 *   - Avatar upload section
 *   - Organizations list section
 *   - Edit Profile modal
 */
export class GeneralSettingsPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto(ROUTES.SETTINGS_GENERAL);
    await this.pageRoot.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  // ─── Page-level locators ──────────────────────────────────────────────────

  get pageRoot(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_PAGE));
  }

  get avatarSection(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_AVATAR_SECTION));
  }

  get profileSection(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_PROFILE_SECTION));
  }

  get organizationsSection(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_ORGANIZATIONS_SECTION));
  }

  // ─── Profile form locators ────────────────────────────────────────────────

  get firstNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_FIRST_NAME_INPUT));
  }

  get lastNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_LAST_NAME_INPUT));
  }

  get emailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_EMAIL_INPUT));
  }

  get localeSelect(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_LOCALE_SELECT));
  }

  get saveButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.GENERAL_SETTINGS_SAVE_BUTTON));
  }

  // ─── Avatar locators ──────────────────────────────────────────────────────

  get avatarUpload(): Locator {
    return this.page.locator(byTestId(TestSelectors.AVATAR_UPLOAD));
  }

  get avatarUploadButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.AVATAR_UPLOAD_UPLOAD_BUTTON));
  }

  get avatarDeleteButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.AVATAR_UPLOAD_DELETE_BUTTON));
  }

  // ─── Edit Profile modal locators ──────────────────────────────────────────

  get editProfileModal(): Locator {
    return this.page.locator(byTestId(TestSelectors.EDIT_PROFILE_MODAL));
  }

  get editProfileFirstNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.EDIT_PROFILE_FIRST_NAME_INPUT));
  }

  get editProfileLastNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.EDIT_PROFILE_LAST_NAME_INPUT));
  }

  get editProfileEmailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.EDIT_PROFILE_EMAIL_INPUT));
  }

  get editProfileSaveButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.EDIT_PROFILE_SAVE_BUTTON));
  }

  get editProfileCancelButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.EDIT_PROFILE_CANCEL_BUTTON));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async waitForProfileFormReady() {
    await expect(this.firstNameInput).not.toBeDisabled({ timeout: TIMEOUTS.SLOW });
  }

  async fillProfileForm(data: { firstName?: string; lastName?: string }) {
    if (data.firstName !== undefined) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(data.lastName);
    }
  }

  async saveProfile() {
    await this.saveButton.click();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectPageVisible() {
    await expect(this.pageRoot).toBeVisible();
    await expect(this.profileSection).toBeVisible();
    await expect(this.avatarSection).toBeVisible();
  }

  async expectProfileFormVisible() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async expectOrganizationsSectionVisible() {
    await expect(this.organizationsSection).toBeVisible();
  }
}
