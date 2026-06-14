/**
 * Test selector constants for Playwright E2E tests and unit tests
 *
 * Centralized location for all data-testid values to ensure consistency
 * and make test maintenance easier.
 */

// Re-export from shared library to avoid duplication
export { TestSelectors, testId, byTestId } from "@/shared/lib/test-selectors";
