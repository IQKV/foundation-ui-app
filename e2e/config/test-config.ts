export const TEST_CONFIG = {
  DEFAULT_TIMEOUT: 10_000,
  NAVIGATION_TIMEOUT: 15_000,

  VIEWPORTS: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  },

  ROUTES: {
    HOME: "/",
    SIGN_IN: "/sign-in",
    DASHBOARD: "/dashboard",
    NOT_FOUND: "/404",
    UNKNOWN: "/this-page-does-not-exist",
  },

  /**
   * Tenant owner credentials — seeded by 20260517000004-demo-e2e-users.xml.
   * Read from process.env so CI secrets override the .env.e2e defaults.
   */
  TENANT_OWNER: {
    email: process.env["E2E_TENANT_OWNER_EMAIL"] ?? "margaret.hayes@demo.iqkv.com",
    password: process.env["E2E_TENANT_OWNER_PASSWORD"] ?? "ChangeMePass123!",
    tenantKey: process.env["E2E_TENANT_KEY"] ?? "demo0001",
  },

  /** Path where Playwright stores the authenticated browser state. */
  STORAGE_STATE: ".playwright/auth/tenant-owner.json",
} as const;
