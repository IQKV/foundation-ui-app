/**
 * Test selector constants for Playwright E2E tests and unit tests
 *
 * Centralized location for all data-testid values to ensure consistency
 * and make test maintenance easier.
 */

export const TestSelectors = {
  // Layout
  APP_ROOT: "app-root",
  APP_LAYOUT: "app-layout",
  APP_HEADER_BAR: "app-header-bar",
  AUTH_LAYOUT: "auth-layout",
  APP_AUTH_LOADING: "app-auth-loading",

  // Header
  APP_HEADER: "app-header",
  HEADER_LOGO: "app-nav-logo",
  HEADER_LOGO_MARK: "sidebar-logo-mark",
  HEADER_USER_MENU: "header-user-menu",
  HEADER_USER_MENU_BUTTON: "header-user-menu-button",
  HEADER_COLOR_SCHEME_TOGGLE: "header-color-scheme-toggle",
  HEADER_MOBILE_MENU_TOGGLE: "header-mobile-menu-toggle",
  SIDEBAR_MOBILE_MENU_TOGGLE: "sidebar-mobile-menu-toggle",

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
  AUTH_GUARD_LOADER: "auth-guard-loader",

  // Pages
  PAGE: (name: string) => `page--${name}`,
  PAGE_HEADER: (name: string) => `page-header--${name}`,

  // Auth
  SIGN_IN_FORM: "sign-in-form",
  SIGN_IN_EMAIL_INPUT: "sign-in-email-input",
  SIGN_IN_PASSWORD_INPUT: "sign-in-password-input",
  SIGN_IN_SUBMIT_BUTTON: "sign-in-submit-button",
  SIGN_IN_TENANT_PICKER: "sign-in-tenant-picker",
  SIGN_IN_TENANT_PICKER_TENANT: (tenantKey: string) => `tenant-picker-${tenantKey}`,
  SIGN_UP_FORM: "sign-up-form",
  SIGN_UP_FIRST_NAME_INPUT: "sign-up-first-name-input",
  SIGN_UP_LAST_NAME_INPUT: "sign-up-last-name-input",
  SIGN_UP_EMAIL_INPUT: "sign-up-email-input",
  SIGN_UP_PASSWORD_INPUT: "sign-up-password-input",
  SIGN_UP_PASSWORD_STRENGTH: "sign-up-password-strength",
  SIGN_UP_SUBMIT_BUTTON: "sign-up-submit-button",
  SIGN_UP_ERROR_ALERT: "sign-up-error-alert",
  SIGN_UP_SIGN_IN_LINK: "sign-up-sign-in-link",
  FORGOT_PASSWORD_FORM: "forgot-password-form",
  FORGOT_PASSWORD_EMAIL_INPUT: "forgot-password-email-input",
  FORGOT_PASSWORD_SUBMIT_BUTTON: "forgot-password-submit-button",
  FORGOT_PASSWORD_ERROR_ALERT: "forgot-password-error-alert",
  FORGOT_PASSWORD_SIGN_IN_LINK: "forgot-password-sign-in-link",
  FORGOT_PASSWORD_SUCCESS: "forgot-password-success",
  FORGOT_PASSWORD_SUCCESS_SIGN_IN_LINK: "forgot-password-success-sign-in-link",
  RESET_PASSWORD_FORM: "reset-password-form",
  RESET_PASSWORD_NEW_PASSWORD_INPUT: "reset-password-new-password-input",
  RESET_PASSWORD_CONFIRM_PASSWORD_INPUT: "reset-password-confirm-password-input",
  RESET_PASSWORD_SUBMIT_BUTTON: "reset-password-submit-button",
  RESET_PASSWORD_ERROR_ALERT: "reset-password-error-alert",
  RESET_PASSWORD_ERROR_NEW_LINK: "reset-password-error-new-link",
  RESET_PASSWORD_SIGN_IN_LINK: "reset-password-sign-in-link",
  RESET_PASSWORD_SUCCESS: "reset-password-success",
  RESET_PASSWORD_SUCCESS_SIGN_IN_LINK: "reset-password-success-sign-in-link",
  RESET_PASSWORD_NO_TOKEN: "reset-password-no-token",
  RESET_PASSWORD_NO_TOKEN_NEW_LINK: "reset-password-no-token-new-link",
  CREATE_ORGANIZATION_FORM: "create-organization-form",
  CREATE_ORGANIZATION_NAME_INPUT: "create-organization-name-input",
  CREATE_ORGANIZATION_SUBMIT_BUTTON: "create-organization-submit-button",
  CREATE_ORGANIZATION_ERROR_ALERT: "create-organization-error-alert",

  // Signup Additional
  PASSWORD_STRENGTH: (testId: string) => testId,
  PASSWORD_STRENGTH_PROGRESS: (testId: string) => `${testId}-progress`,
  PASSWORD_STRENGTH_REQ: (testId: string, index: number) => `${testId}-req-${index}`,
  PROVISIONING_WAIT: "provisioning-wait",
  PROVISIONING_WAIT_TIMEOUT_ICON: "provisioning-wait-timeout-icon",
  PROVISIONING_WAIT_LOADER: "provisioning-wait-loader",
  PROVISIONING_WAIT_TITLE: "provisioning-wait-title",
  PROVISIONING_WAIT_DESCRIPTION: "provisioning-wait-description",
  PROVISIONING_WAIT_STEPS: "provisioning-wait-steps",
  PROVISIONING_WAIT_STEP: (index: number) => `provisioning-wait-step-${index}`,
  VERIFY_EMAIL_PROMPT: "verify-email-prompt",
  VERIFY_EMAIL_PROMPT_ICON: "verify-email-prompt-icon",
  VERIFY_EMAIL_PROMPT_TITLE: "verify-email-prompt-title",
  VERIFY_EMAIL_PROMPT_DESCRIPTION: "verify-email-prompt-description",
  VERIFY_EMAIL_PROMPT_ENTER_WORKSPACE_BUTTON: "verify-email-prompt-enter-workspace-button",
  VERIFY_EMAIL_PROMPT_RESEND_BUTTON: "verify-email-prompt-resend-button",

  // Notification Bell
  NOTIFICATION_BELL_BUTTON: "notification-bell-button",
  NOTIFICATION_BELL_DROPDOWN: "notification-bell-dropdown",
  NOTIFICATION_MARK_ALL_READ: "notification-mark-all-read",
  NOTIFICATION_SEE_ALL: "notification-see-all",
  NOTIFICATION_DELETE_ALL: "notification-delete-all",
  NOTIFICATION_ITEM: (id: string) => `notification-item-${id}`,
  NOTIFICATION_DELETE: (id: string) => `notification-delete-${id}`,

  // Billing
  BILLING_INFO: "billing-info",
  BILLING_INFO_SETUP: "billing-info-setup",
  BILLING_INFO_SETUP_FORM: "billing-info-setup-form",
  BILLING_INFO_EMAIL_INPUT: "billing-info-email-input",
  BILLING_INFO_COMPANY_INPUT: "billing-info-company-input",
  BILLING_INFO_CURRENCY_INPUT: "billing-info-currency-input",
  BILLING_INFO_SAVE_BUTTON: "billing-info-save-button",
  BILLING_INFO_LOADING: "billing-info-loading",
  BILLING_INFO_ERROR: "billing-info-error",
  BILLING_INFO_FORM: "billing-info-form",
  BILLING_PORTAL_BUTTON: "billing-portal-button",
  PLAN_LIST: "plan-list",
  PLAN_LIST_LOADING: "plan-list-loading",
  PLAN_LIST_ERROR: "plan-list-error",
  PLAN_LIST_EMPTY: "plan-list-empty",
  PLAN_CARD: (planCode: string) => `plan-card-${planCode}`,
  PLAN_CARD_CURRENT_BADGE: (planCode: string) => `plan-card-${planCode}-current-badge`,
  PLAN_CARD_FEATURE: (planCode: string, index: number) => `plan-card-${planCode}-feature-${index}`,
  PLAN_CARD_BUTTON: (planCode: string) => `plan-card-${planCode}-button`,
  CURRENT_SUBSCRIPTION: "current-subscription",
  CURRENT_SUBSCRIPTION_LOADING: "current-subscription-loading",
  CURRENT_SUBSCRIPTION_NO_SUBSCRIPTION: "current-subscription-no-subscription",
  CURRENT_SUBSCRIPTION_STATUS_BADGE: "current-subscription-status-badge",
  CURRENT_SUBSCRIPTION_PLAN: "current-subscription-plan",
  CURRENT_SUBSCRIPTION_NEXT_BILLING_DATE: "current-subscription-next-billing-date",
  CURRENT_SUBSCRIPTION_CANCEL_INFO: "current-subscription-cancel-info",

  // Entitlements
  ENTITLEMENTS_LOADING: "entitlements-loading",
  ENTITLEMENTS_ERROR: "entitlements-error",
  ENTITLEMENTS_NO_SUBSCRIPTION: "entitlements-no-subscription",
  ENTITLEMENTS_CARD: "entitlements-card",
  ENTITLEMENTS_STATUS_BADGE: "entitlements-status-badge",
  ENTITLEMENTS_PLAN_CODE: "entitlements-plan-code",
  ENTITLEMENTS_PERIOD_END: "entitlements-period-end",

  // Plan Features
  PLAN_FEATURES: "plan-features",
  PLAN_FEATURE_PRIORITY_SUPPORT: "plan-feature-priority-support",
  PLAN_FEATURE_MAX_USERS: "plan-feature-max-users",
  PLAN_FEATURE_MAX_PROJECTS: "plan-feature-max-projects",
  REFUND_LIST: "refund-list",
  REFUND_LIST_LOADING: "refund-list-loading",
  REFUND_LIST_ERROR: "refund-list-error",
  REFUND_LIST_TABLE: "refund-list-table",
  REFUND_LIST_ROW: (refundId: string) => `refund-list-row-${refundId}`,
  REFUND_LIST_ROW_DATE: (refundId: string) => `refund-list-row-${refundId}-date`,
  REFUND_LIST_ROW_AMOUNT: (refundId: string) => `refund-list-row-${refundId}-amount`,
  REFUND_LIST_ROW_STATUS_BADGE: (refundId: string) => `refund-list-row-${refundId}-status-badge`,
  REFUND_LIST_ROW_PAYMENT_ID: (refundId: string) => `refund-list-row-${refundId}-payment-id`,

  // Organization
  ORGANIZATION_SETTINGS: "organization-settings",
  ORGANIZATION_SETTINGS_LOADING: "organization-settings-loading",
  ORGANIZATION_SETTINGS_ERROR: "organization-settings-error",
  ORGANIZATION_SETTINGS_RETRY_PROVISIONING_BUTTON:
    "organization-settings-retry-provisioning-button",
  ORGANIZATION_SETTINGS_STATUS_BADGE: "organization-settings-status-badge",
  ORGANIZATION_SETTINGS_FORM: "organization-settings-form",
  ORGANIZATION_SETTINGS_NAME_INPUT: "organization-settings-name-input",
  ORGANIZATION_SETTINGS_KEY_INPUT: "organization-settings-key-input",
  ORGANIZATION_SETTINGS_SAVE_BUTTON: "organization-settings-save-button",

  // Modals
  UPDATE_MEMBER_AUTHORITIES_MODAL: "update-member-authorities-modal",
  UPDATE_MEMBER_AUTHORITIES_FORM: "update-member-authorities-form",
  UPDATE_MEMBER_AUTHORITIES_RADIO_GROUP: "update-member-authorities-radio-group",
  UPDATE_MEMBER_AUTHORITIES_RADIO_OWNER: "update-member-authorities-radio-owner",
  UPDATE_MEMBER_AUTHORITIES_RADIO_MEMBER: "update-member-authorities-radio-member",
  UPDATE_MEMBER_AUTHORITIES_CANCEL_BUTTON: "update-member-authorities-cancel-button",
  UPDATE_MEMBER_AUTHORITIES_SAVE_BUTTON: "update-member-authorities-save-button",
  TRANSFER_OWNERSHIP_MODAL: "transfer-ownership-modal",
  TRANSFER_OWNERSHIP_FORM: "transfer-ownership-form",
  TRANSFER_OWNERSHIP_ALERT: "transfer-ownership-alert",
  TRANSFER_OWNERSHIP_CANCEL_BUTTON: "transfer-ownership-cancel-button",
  TRANSFER_OWNERSHIP_CONFIRM_BUTTON: "transfer-ownership-confirm-button",
  UNBAN_MEMBER_MODAL: "unban-member-modal",
  UNBAN_MEMBER_ALERT: "unban-member-alert",
  UNBAN_MEMBER_CANCEL_BUTTON: "unban-member-cancel-button",
  UNBAN_MEMBER_CONFIRM_BUTTON: "unban-member-confirm-button",
  BAN_MEMBER_MODAL: "ban-member-modal",
  BAN_MEMBER_FORM: "ban-member-form",
  BAN_MEMBER_ALERT: "ban-member-alert",
  BAN_MEMBER_REASON_INPUT: "ban-member-reason-input",
  BAN_MEMBER_EXPIRES_INPUT: "ban-member-expires-input",
  BAN_MEMBER_CANCEL_BUTTON: "ban-member-cancel-button",
  BAN_MEMBER_CONFIRM_BUTTON: "ban-member-confirm-button",
  REMOVE_MEMBER_MODAL: "remove-member-modal",
  REMOVE_MEMBER_CANCEL_BUTTON: "remove-member-cancel-button",
  REMOVE_MEMBER_CONFIRM_BUTTON: "remove-member-confirm-button",
  CHANGE_PASSWORD_MODAL: "change-password-modal",
  CHANGE_PASSWORD_FORM: "change-password-form",
  CHANGE_PASSWORD_CURRENT_INPUT: "change-password-current-input",
  CHANGE_PASSWORD_NEW_INPUT: "change-password-new-input",
  CHANGE_PASSWORD_CONFIRM_INPUT: "change-password-confirm-input",
  CHANGE_PASSWORD_REQUIREMENTS: "change-password-requirements",
  CHANGE_PASSWORD_CANCEL_BUTTON: "change-password-cancel-button",
  CHANGE_PASSWORD_CONFIRM_BUTTON: "change-password-confirm-button",
  INVITATION_DETAILS_MODAL: "invitation-details-modal",
  INVITATION_DETAILS_EMAIL_INPUT: "invitation-details-email-input",
  INVITATION_DETAILS_ROLE_INPUT: "invitation-details-role-input",
  INVITATION_DETAILS_STATUS_BADGE: "invitation-details-status-badge",
  INVITATION_DETAILS_EXPIRES_INPUT: "invitation-details-expires-input",
  INVITATION_DETAILS_SENT_INPUT: "invitation-details-sent-input",
  INVITATION_DETAILS_REVOKE_ALERT: "invitation-details-revoke-alert",
  INVITATION_DETAILS_CLOSE_BUTTON: "invitation-details-close-button",
  INVITATION_DETAILS_REVOKE_BUTTON: "invitation-details-revoke-button",
  SEND_INVITATION_MODAL: "send-invitation-modal",
  SEND_INVITATION_FORM: "send-invitation-form",
  SEND_INVITATION_EMAIL_INPUT: "send-invitation-email-input",
  SEND_INVITATION_ROLE_SELECT: "send-invitation-role-select",
  SEND_INVITATION_CANCEL_BUTTON: "send-invitation-cancel-button",
  SEND_INVITATION_CONFIRM_BUTTON: "send-invitation-confirm-button",
  EDIT_PROFILE_MODAL: "edit-profile-modal",
  EDIT_PROFILE_FORM: "edit-profile-form",
  EDIT_PROFILE_EMAIL_STATUS: "edit-profile-email-status",
  EDIT_PROFILE_EMAIL_VERIFIED_BADGE: "edit-profile-email-verified-badge",
  EDIT_PROFILE_FIRST_NAME_INPUT: "edit-profile-first-name-input",
  EDIT_PROFILE_LAST_NAME_INPUT: "edit-profile-last-name-input",
  EDIT_PROFILE_EMAIL_INPUT: "edit-profile-email-input",
  EDIT_PROFILE_LOCALE_SELECT: "edit-profile-locale-select",
  EDIT_PROFILE_CANCEL_BUTTON: "edit-profile-cancel-button",
  EDIT_PROFILE_SAVE_BUTTON: "edit-profile-save-button",

  // Member Actions
  MEMBER_ACTIONS_MENU: "member-actions-menu",
  MEMBER_ACTIONS_MENU_BUTTON: "member-actions-menu-button",
  MEMBER_ACTIONS_DROPDOWN: "member-actions-dropdown",
  MEMBER_ACTIONS_CHANGE_ROLE: "member-actions-change-role",
  MEMBER_ACTIONS_TRANSFER_OWNERSHIP: "member-actions-transfer-ownership",
  MEMBER_ACTIONS_BAN: "member-actions-ban",
  MEMBER_ACTIONS_UNBAN: "member-actions-unban",
  MEMBER_ACTIONS_REMOVE: "member-actions-remove",

  // Avatar
  AVATAR_UPLOAD: "avatar-upload",
  AVATAR_UPLOAD_FILE_INPUT: "avatar-upload-file-input",
  AVATAR_UPLOAD_AVATAR: "avatar-upload-avatar",
  AVATAR_UPLOAD_UPLOAD_BUTTON: "avatar-upload-upload-button",
  AVATAR_UPLOAD_DELETE_BUTTON: "avatar-upload-delete-button",

  // Tenant Switcher
  TENANT_SWITCHER_TRIGGER: "tenant-switcher-trigger",
  TENANT_SWITCHER_DROPDOWN: "tenant-switcher-dropdown",
  TENANT_SWITCHER_OPTION: (tenantKey: string) => `tenant-switcher-option-${tenantKey}`,
  TENANT_SWITCHER_NEW_ORG: "tenant-switcher-new-org",

  // Sign Out
  SIGN_OUT_BUTTON: "sign-out-button",

  // Error Pages
  PAGE_404: "page-404",
  PAGE_500: "page-500",
  PAGE_UNAUTHORIZED: "page-unauthorized",

  // Notifications
  NOTIFICATION: (type: string) => `notification--${type}`,
  NOTIFICATION_CONTAINER: "notifications-container",
  NOTIFICATION_PAGE: "notification-page",
  NOTIFICATION_PAGE_MARK_ALL_READ_BUTTON: "notification-page-mark-all-read-button",
  NOTIFICATION_PAGE_CLEAR_ALL_BUTTON: "notification-page-clear-all-button",
  NOTIFICATION_PAGE_PAGINATION: "notification-page-pagination",

  // General Settings
  GENERAL_SETTINGS_PAGE: "general-settings-page",
  GENERAL_SETTINGS_AVATAR_SECTION: "general-settings-avatar-section",
  GENERAL_SETTINGS_PROFILE_SECTION: "general-settings-profile-section",
  GENERAL_SETTINGS_FIRST_NAME_INPUT: "general-settings-first-name-input",
  GENERAL_SETTINGS_LAST_NAME_INPUT: "general-settings-last-name-input",
  GENERAL_SETTINGS_EMAIL_INPUT: "general-settings-email-input",
  GENERAL_SETTINGS_LOCALE_SELECT: "general-settings-locale-select",
  GENERAL_SETTINGS_SAVE_BUTTON: "general-settings-save-button",
  GENERAL_SETTINGS_ORGANIZATIONS_SECTION: "general-settings-organizations-section",
  GENERAL_SETTINGS_ORGANIZATION_ITEM: (orgName: string) =>
    `general-settings-organization-item-${orgName}`,

  // Security Settings
  SECURITY_SETTINGS_PAGE: "security-settings-page",
  SECURITY_SETTINGS_ROLES_SECTION: "security-settings-roles-section",
  SECURITY_SETTINGS_ROLE_ITEM: (role: string) => `security-settings-role-item-${role}`,
  SECURITY_SETTINGS_PASSWORD_SECTION: "security-settings-password-section",
  SECURITY_SETTINGS_CURRENT_PASSWORD_INPUT: "security-settings-current-password-input",
  SECURITY_SETTINGS_NEW_PASSWORD_INPUT: "security-settings-new-password-input",
  SECURITY_SETTINGS_CONFIRM_PASSWORD_INPUT: "security-settings-confirm-password-input",
  SECURITY_SETTINGS_CHANGE_PASSWORD_BUTTON: "security-settings-change-password-button",

  // Organization Settings Page
  ORGANIZATION_SETTINGS_PAGE: "organization-settings-page",
  ORGANIZATION_SETTINGS_PAGE_SEARCH_INPUT: "organization-settings-page-search-input",
  ORGANIZATION_SETTINGS_PAGE_REFRESH_BUTTON: "organization-settings-page-refresh-button",
  ORGANIZATION_SETTINGS_PAGE_TABLE: "organization-settings-page-table",
  ORGANIZATION_SETTINGS_PAGE_CREATE_ORG_BUTTON: "organization-settings-page-create-org-button",

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
