/**
 * App route constants used in navigation helpers and test assertions.
 *
 * Keep these in sync with the TanStack Router route tree in src/pages/.
 * Using string literals here (rather than importing from the app bundle)
 * keeps the e2e layer fully independent of the source bundle.
 */
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  SETTINGS_GENERAL: "/settings/general",
  SETTINGS_SECURITY: "/settings/security",
  SETTINGS_ORGANIZATION: "/settings/organization",
  NOT_FOUND: "/404",
  SERVER_ERROR: "/500",
  UNKNOWN: "/this-page-does-not-exist",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
