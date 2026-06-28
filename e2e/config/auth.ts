/**
 * Authentication configuration for E2E tests.
 *
 * Credentials are read from environment variables so CI secrets take
 * precedence over the committed .env.e2e defaults (which are safe to
 * commit — they target a demo/staging database only).
 */
export const AUTH_CONFIG = {
  /**
   * Tenant owner user seeded by 20260517000004-demo-e2e-users.xml.
   * Authenticates via POST /v1/iam/auth/signin with tenant key demo0001.
   */
  TENANT_OWNER: {
    email: process.env["E2E_TENANT_OWNER_EMAIL"] ?? "margaret.hayes@demo.iqkv.com",
    password: process.env["E2E_TENANT_OWNER_PASSWORD"] ?? "ChangeMePass123!",
    tenantKey: process.env["E2E_TENANT_KEY"] ?? "demo0001",
  },

  /** Path where Playwright stores the pre-authenticated browser storage state. */
  STORAGE_STATE: ".playwright/auth/tenant-owner.json",
} as const;
