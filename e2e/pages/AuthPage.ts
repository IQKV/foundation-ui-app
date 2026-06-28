import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";
import { ROUTES } from "../config/routes.js";
import { TIMEOUTS } from "../config/timeouts.js";

/**
 * Page Object for all authentication flows:
 *   - Sign-in
 *   - Sign-up
 *   - Forgot password
 *   - Reset password
 */
export class AuthPage {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goToSignIn() {
    await this.page.goto(ROUTES.SIGN_IN);
    await this.signInForm.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToSignUp() {
    await this.page.goto(ROUTES.SIGN_UP);
    await this.signUpForm.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToForgotPassword() {
    await this.page.goto(ROUTES.FORGOT_PASSWORD);
    await this.forgotPasswordForm.waitFor({ state: "visible", timeout: TIMEOUTS.NAVIGATION });
  }

  async goToResetPassword(token?: string) {
    const url = token ? `${ROUTES.RESET_PASSWORD}?token=${token}` : ROUTES.RESET_PASSWORD;
    await this.page.goto(url);
  }

  // ─── Sign-in locators ─────────────────────────────────────────────────────

  get authLayout(): Locator {
    return this.page.locator(byTestId(TestSelectors.AUTH_LAYOUT));
  }

  get signInForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_FORM));
  }

  get signInEmailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_EMAIL_INPUT));
  }

  get signInPasswordInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_PASSWORD_INPUT));
  }

  get signInSubmitButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_SUBMIT_BUTTON));
  }

  get tenantPicker(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_TENANT_PICKER));
  }

  tenantPickerOption(tenantKey: string): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_IN_TENANT_PICKER_TENANT(tenantKey)));
  }

  // ─── Sign-up locators ─────────────────────────────────────────────────────

  get signUpForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_FORM));
  }

  get signUpFirstNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_FIRST_NAME_INPUT));
  }

  get signUpLastNameInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_LAST_NAME_INPUT));
  }

  get signUpEmailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_EMAIL_INPUT));
  }

  get signUpPasswordInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_PASSWORD_INPUT));
  }

  get signUpPasswordStrength(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_PASSWORD_STRENGTH));
  }

  get signUpSubmitButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_SUBMIT_BUTTON));
  }

  get signUpErrorAlert(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_ERROR_ALERT));
  }

  get signUpSignInLink(): Locator {
    return this.page.locator(byTestId(TestSelectors.SIGN_UP_SIGN_IN_LINK));
  }

  // ─── Forgot-password locators ─────────────────────────────────────────────

  get forgotPasswordForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.FORGOT_PASSWORD_FORM));
  }

  get forgotPasswordEmailInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.FORGOT_PASSWORD_EMAIL_INPUT));
  }

  get forgotPasswordSubmitButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.FORGOT_PASSWORD_SUBMIT_BUTTON));
  }

  get forgotPasswordErrorAlert(): Locator {
    return this.page.locator(byTestId(TestSelectors.FORGOT_PASSWORD_ERROR_ALERT));
  }

  get forgotPasswordSuccess(): Locator {
    return this.page.locator(byTestId(TestSelectors.FORGOT_PASSWORD_SUCCESS));
  }

  get forgotPasswordSignInLink(): Locator {
    return this.page.locator(byTestId(TestSelectors.FORGOT_PASSWORD_SIGN_IN_LINK));
  }

  // ─── Reset-password locators ──────────────────────────────────────────────

  get resetPasswordForm(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_FORM));
  }

  get resetPasswordNewInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_NEW_PASSWORD_INPUT));
  }

  get resetPasswordConfirmInput(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_CONFIRM_PASSWORD_INPUT));
  }

  get resetPasswordSubmitButton(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_SUBMIT_BUTTON));
  }

  get resetPasswordErrorAlert(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_ERROR_ALERT));
  }

  get resetPasswordSuccess(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_SUCCESS));
  }

  get resetPasswordNoToken(): Locator {
    return this.page.locator(byTestId(TestSelectors.RESET_PASSWORD_NO_TOKEN));
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async fillSignInForm(email: string, password: string) {
    await this.signInEmailInput.fill(email);
    await this.signInPasswordInput.fill(password);
  }

  async submitSignIn() {
    await this.signInSubmitButton.click();
  }

  async signIn(email: string, password: string) {
    await this.fillSignInForm(email, password);
    await this.submitSignIn();
  }

  async fillForgotPasswordForm(email: string) {
    await this.forgotPasswordEmailInput.fill(email);
  }

  async submitForgotPassword() {
    await this.forgotPasswordSubmitButton.click();
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  async expectSignInPageVisible() {
    await expect(this.authLayout).toBeVisible();
    await expect(this.signInForm).toBeVisible();
    await expect(this.signInEmailInput).toBeVisible();
    await expect(this.signInPasswordInput).toBeVisible();
    await expect(this.signInSubmitButton).toBeVisible();
  }

  async expectSignUpPageVisible() {
    await expect(this.authLayout).toBeVisible();
    await expect(this.signUpForm).toBeVisible();
  }

  async expectForgotPasswordPageVisible() {
    await expect(this.authLayout).toBeVisible();
    await expect(this.forgotPasswordForm).toBeVisible();
  }

  async expectForgotPasswordSuccessVisible() {
    await expect(this.forgotPasswordSuccess).toBeVisible({
      timeout: TIMEOUTS.SLOW,
    });
  }

  async expectRedirectedToSignIn() {
    await expect(this.page).toHaveURL(/sign-in/);
    await expect(this.signInForm).toBeVisible();
  }
}
