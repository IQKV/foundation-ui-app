import { expect, type Page, type Locator } from "@playwright/test";
import { TestSelectors, byTestId } from "../lib/test-selectors.js";

export class AppPage {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async goTo404() {
    await this.page.goto("/404");
    await this.page.waitForLoadState("networkidle");
  }

  async expectHomePageVisible() {
    // Unauthenticated navigation to "/" redirects to sign-in.
    // Verify the auth page rendered correctly.
    await expect(this.page.getByRole("heading", { name: /welcome/i })).toBeVisible();
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
  async getByTestId(testId: string): Promise<Locator> {
    return this.page.locator(byTestId(testId));
  }

  async clickByTestId(testId: string) {
    const element = await this.getByTestId(testId);
    await element.click();
  }

  async waitForTestId(testId: string, options?: { state?: "attached" | "visible" | "hidden" }) {
    const element = await this.getByTestId(testId);
    await element.waitFor(options);
  }
}
