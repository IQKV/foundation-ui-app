import { test, expect } from "@playwright/test";
import { AppPage, testUtils } from "./utils/test-helpers";

test.describe("App Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    const app = new AppPage(page);
    await app.goToHome();
    await expect(page).toHaveURL(/\/?$/);
    await app.expectHomePageVisible();
  });

  test("404 page loads successfully", async ({ page }) => {
    const app = new AppPage(page);
    await app.goTo404();
    await app.expect404PageVisible();
  });

  test("unknown route shows 404", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await testUtils.waitForPageReady(page);
    // TanStack Router renders the not-found component
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("app has no uncaught exceptions on load", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/");
    await testUtils.waitForPageReady(page);

    expect(pageErrors).toHaveLength(0);
  });

  test("app has no critical console errors on load", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await testUtils.waitForPageReady(page);

    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes("Failed to load resource") && !e.includes("NetworkError"),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("react root is rendered", async ({ page }) => {
    await page.goto("/");
    await testUtils.waitForPageReady(page);
    await expect(page.locator("#root")).toBeAttached();
  });

  test("essential meta tags are present", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator('meta[name="viewport"]').count()).toBeGreaterThan(0);
  });

  test("app is responsive on different viewports", async ({ page }) => {
    const app = new AppPage(page);
    await testUtils.testResponsiveDesign(page, async () => {
      await app.goToHome();
      await app.expectHomePageVisible();
    });
  });

  test("404 page go home link navigates to homepage", async ({ page }) => {
    const app = new AppPage(page);
    await app.goTo404();
    await page.getByRole("link", { name: "Go home" }).click();
    await expect(page).toHaveURL(/\/?$/);
    await app.expectHomePageVisible();
  });
});
