/**
 * Re-exports the extended Playwright `test` and `expect` objects.
 *
 * Import from here in any spec that needs an authenticated page:
 *
 *   import { test, expect } from "../fixtures";
 *
 * For unauthenticated specs (smoke, 404, etc.) import directly from
 * "@playwright/test".
 */
export { test, expect } from "./auth.fixture";
export type { AuthFixtures } from "./auth.fixture";
