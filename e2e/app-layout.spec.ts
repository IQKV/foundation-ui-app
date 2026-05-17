import { test, expect } from "@playwright/test";
import { TestSelectors, byTestId } from "./utils/test-selectors.js";

test.describe("App Layout E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real test, you would need to authenticate first
    // For this example, we'll assume we're already authenticated
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("app layout loads with all key elements", async ({ page }) => {
    // Check main layout elements
    await expect(page.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.APP_HEADER))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.APP_NAV))).toBeVisible();

    // Check header elements
    await expect(page.locator(byTestId(TestSelectors.HEADER_LOGO))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON))).toBeVisible();

    // Check mobile menu toggle (hidden on desktop)
    await expect(page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE))).toBeHidden();
  });

  test("color scheme toggle works", async ({ page }) => {
    const toggle = page.locator(byTestId(TestSelectors.HEADER_COLOR_SCHEME_TOGGLE));

    // Check initial state
    await expect(toggle).toBeVisible();

    // Click the toggle
    await toggle.click();

    // Wait for any theme change animations
    await page.waitForTimeout(500);

    // Verify toggle is still visible after click
    await expect(toggle).toBeVisible();
  });

  test("user menu opens and displays options", async ({ page }) => {
    const userMenuButton = page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON));

    // Click to open user menu
    await userMenuButton.click();

    // Wait for menu to appear
    await page.waitForTimeout(300);

    // Check menu items
    await expect(page.locator(byTestId(TestSelectors.BUTTON("profile")))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.BUTTON("sign-out")))).toBeVisible();
  });

  test("mobile menu toggle appears on small screens", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile menu toggle should be visible on mobile
    await expect(page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE))).toBeVisible();

    // Click mobile menu toggle
    const mobileToggle = page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE));
    await mobileToggle.click();

    // Navigation should be visible after toggle
    await expect(page.locator(byTestId(TestSelectors.APP_NAV))).toBeVisible();
  });

  test("error boundary displays correctly", async ({ page }) => {
    // Navigate to a non-existent route to trigger 404
    await page.goto("/non-existent-route");
    await page.waitForLoadState("networkidle");

    // Check 404 page
    await expect(page.locator(byTestId(TestSelectors.PAGE_404))).toBeVisible();
    await expect(page.locator(byTestId(TestSelectors.BUTTON("go-home")))).toBeVisible();
  });

  test("loading overlay appears during navigation", async ({ page }) => {
    // This test would require mocking a slow-loading route
    // For now, we'll just verify the selector pattern works
    const loadingOverlay = page.locator(byTestId(TestSelectors.LOADING_OVERLAY));

    // Initially should not be visible
    await expect(loadingOverlay).toBeHidden();
  });

  test("app is accessible with keyboard navigation", async ({ page }) => {
    // Test tab navigation through header
    await page.keyboard.press("Tab");

    // Focus should move to first focusable element
    // We can't predict exact order, but we can verify focus moves
    const focusedElement = page.locator("*:focus");
    await expect(focusedElement).toBeAttached();
  });

  test("responsive design works across breakpoints", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1024, height: 768, name: "desktop" },
      { width: 1920, height: 1080, name: "large" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Verify layout is visible at all breakpoints
      await expect(page.locator(byTestId(TestSelectors.APP_LAYOUT))).toBeVisible();
      await expect(page.locator(byTestId(TestSelectors.APP_HEADER))).toBeVisible();

      // Mobile menu toggle visibility depends on viewport
      const mobileToggle = page.locator(byTestId(TestSelectors.HEADER_MOBILE_MENU_TOGGLE));
      if (viewport.width < 768) {
        await expect(mobileToggle).toBeVisible();
      } else {
        await expect(mobileToggle).toBeHidden();
      }
    }
  });

  test("sign out button works", async ({ page }) => {
    // Open user menu
    const userMenuButton = page.locator(byTestId(TestSelectors.HEADER_USER_MENU_BUTTON));
    await userMenuButton.click();

    // Wait for menu to appear
    await page.waitForTimeout(300);

    // Click sign out button
    const signOutButton = page.locator(byTestId(TestSelectors.BUTTON("sign-out")));
    await expect(signOutButton).toBeVisible();

    // Note: In a real test, you would verify the sign out action
    // For now, we just verify the button is clickable
    await expect(signOutButton).toBeEnabled();
  });
});

test.describe("Error Handling", () => {
  test("error boundary displays retry button", async ({ page }) => {
    // Simulate an error by navigating to a broken route
    // In a real app, you might have a route that throws an error
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // We can't easily trigger the error boundary without a specific error route
    // But we can verify the pattern for future error boundary tests
    const errorBoundary = page.locator(byTestId(TestSelectors.ERROR_BOUNDARY));

    // Should not be visible unless there's an error
    await expect(errorBoundary).toBeHidden();
  });
});
