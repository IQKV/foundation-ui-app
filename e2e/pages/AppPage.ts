import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";

export class AppPage {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto("/");
    // Wait for a visible sentinel rather than networkidle
    // (networkidle is unreliable when the app holds open WS/SSE connections)
    await this.page
      .locator(`${byTestId(TestSelectors.AUTH_LAYOUT)}, ${byTestId(TestSelectors.APP_LAYOUT)}`)
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  async goTo404() {
    await this.page.goto("/404");
    await this.page.locator(byTestId(TestSelectors.PAGE_404)).waitFor({
      state: "visible",
      timeout: 15_000,
    });
  }

  async expectHomePageVisible() {
    // Unauthenticated navigation to "/" redirects to sign-in.
    await expect(this.page.locator(byTestId(TestSelectors.SIGN_IN_FORM))).toBeVisible();
  }

  async expect404PageVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(this.page.getByRole("heading", { name: "404" })).toBeVisible();
  }

  async expectAppLayoutVisible() {
    await expect(this.page.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible();
    await expect(this.page.locator(byTestId(TestSelectors.APP_HEADER))).toBeVisible();
  }

  // Helper methods for common test operations
  getByTestId(testId: string): Locator {
    return this.page.locator(byTestId(testId));
  }

  async clickByTestId(testId: string) {
    await this.getByTestId(testId).click();
  }

  async waitForTestId(testId: string, options?: { state?: "attached" | "visible" | "hidden" }) {
    await this.getByTestId(testId).waitFor(options);
  }
}
