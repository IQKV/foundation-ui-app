import { expect, type Page } from "@playwright/test";
import { TestSelectors, byTestId } from "./test-selectors.js";

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

  // Test ID utilities
  byTestId,

  async expectVisibleByTestId(page: Page, testId: string) {
    await expect(page.locator(byTestId(testId))).toBeVisible();
  },

  async expectHiddenByTestId(page: Page, testId: string) {
    await expect(page.locator(byTestId(testId))).toBeHidden();
  },

  async expectAttachedByTestId(page: Page, testId: string) {
    await expect(page.locator(byTestId(testId))).toBeAttached();
  },
};
