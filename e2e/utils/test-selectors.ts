/**
 * Test selector constants for Playwright E2E tests
 *
 * Centralized location for all data-testid values to ensure consistency
 * and make test maintenance easier.
 */

export const TestSelectors = {
  // Layout
  APP_ROOT: "app-root",
  APP_LAYOUT: "app-layout",
  AUTH_LAYOUT: "auth-layout",

  // Header
  APP_HEADER: "app-header",
  HEADER_LOGO: "header-logo",
  HEADER_USER_MENU: "header-user-menu",
  HEADER_USER_MENU_BUTTON: "header-user-menu-button",
  HEADER_COLOR_SCHEME_TOGGLE: "header-color-scheme-toggle",
  HEADER_MOBILE_MENU_TOGGLE: "header-mobile-menu-toggle",

  // Navigation
  APP_NAV: "app-nav",
  NAV_ITEM: (name: string) => `nav-item--${name}`,
  NAV_SUBMENU: (name: string) => `nav-submenu--${name}`,

  // Common UI Elements
  BUTTON: (name: string) => `button--${name}`,
  LINK: (name: string) => `link--${name}`,
  INPUT: (name: string) => `input--${name}`,
  FORM: (name: string) => `form--${name}`,
  MODAL: (name: string) => `modal--${name}`,
  ALERT: (name: string) => `alert--${name}`,
  LOADING_OVERLAY: "loading-overlay",
  ERROR_BOUNDARY: "error-boundary",

  // Pages
  PAGE: (name: string) => `page--${name}`,
  PAGE_HEADER: (name: string) => `page-header--${name}`,

  // Auth
  SIGN_IN_FORM: "sign-in-form",
  SIGN_IN_EMAIL_INPUT: "sign-in-email-input",
  SIGN_IN_PASSWORD_INPUT: "sign-in-password-input",
  SIGN_IN_SUBMIT_BUTTON: "sign-in-submit-button",
  SIGN_UP_FORM: "sign-up-form",
  FORGOT_PASSWORD_FORM: "forgot-password-form",

  // Error Pages
  PAGE_404: "page-404",
  PAGE_500: "page-500",
  PAGE_UNAUTHORIZED: "page-unauthorized",

  // Notifications
  NOTIFICATION: (type: string) => `notification--${type}`,
  NOTIFICATION_CONTAINER: "notifications-container",

  // Modals
  MODAL_CONTAINER: "modals-container",
  MODAL_CLOSE_BUTTON: "modal-close-button",
  MODAL_CONFIRM_BUTTON: "modal-confirm-button",
  MODAL_CANCEL_BUTTON: "modal-cancel-button",

  // User Interface
  USER_STATUS_BADGE: "user-status-badge",
  TENANT_STATUS_BADGE: "tenant-status-badge",
  LOCALE_SWITCHER: "locale-switcher",
} as const;

/**
 * Helper function to create data-testid attribute
 */
export const testId = (value: string): { "data-testid": string } => ({
  "data-testid": value,
});

/**
 * Helper function to create test selector for Playwright
 */
export const byTestId = (value: string): string => `[data-testid="${value}"]`;
