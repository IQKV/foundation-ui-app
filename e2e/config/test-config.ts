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
    NOT_FOUND: "/404",
    UNKNOWN: "/this-page-does-not-exist",
  },
} as const;
