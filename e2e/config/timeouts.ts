/**
 * Centralised timeout constants for Playwright tests.
 *
 * Keep all timeout values here so they can be tuned in one place.
 * playwright.config.ts uses its own top-level `timeout` / `expect.timeout`
 * settings — these constants are for explicit `{ timeout }` options inside
 * test helpers and fixtures.
 */
export const TIMEOUTS = {
  /** Default assertion timeout (toBeVisible, toHaveText, etc.) */
  DEFAULT: 10_000,

  /** Page / URL navigation timeout */
  NAVIGATION: 15_000,

  /** Longer wait for slow operations (auth, provisioning, heavy data fetches) */
  SLOW: 30_000,
} as const;
