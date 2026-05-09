import { expect, type Page } from "@playwright/test";

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
    await expect(this.page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  }

  async expect404PageVisible() {
    await expect(this.page.getByRole("heading", { name: "404" })).toBeVisible();
  }
}

export const testUtils = {
  async waitForPageReady(page: Page) {
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState("domcontentloaded");
  },

  async testResponsiveDesign(page: Page, testCallback: (page: Page) => Promise<void>) {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await testCallback(page);
    }
  },
};
