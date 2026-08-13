const readRuntimeEnv = (key: string): string | undefined => {
  const w: any = typeof window !== "undefined" ? (window as any) : undefined;
  return (w && w[key]) ?? (import.meta as any).env?.[key];
};

const ENV_KEYS = [
  "VITE_API_SERVER_URL",
  "VITE_LOG_LEVEL",
  "VITE_ROLLOUT_MODE",
  "VITE_DEMO_MODE",
  "VITE_ENABLE_MAGIC_LINK",
  "VITE_PAYMENT_GATEWAY_TYPE",
  "VITE_APP_TITLE",
  "VITE_APP_BRAND_NAME",
  "VITE_APP_BRAND_TAGLINE",
  "VITE_APP_AUTH_SECTION_LABEL",
  "VITE_APP_AUTH_BADGES",
  "VITE_APP_AUTH_HEADLINE_1",
  "VITE_APP_AUTH_HEADLINE_2",
  "VITE_APP_AUTH_TAGLINE",
  "VITE_APP_ONBOARDING_WELCOME",
  "VITE_APP_FOOTER_COPYRIGHT",
  "VITE_APP_SUPPORT_EMAIL",
  "VITE_APP_SUPPORT_URL",
  "VITE_APP_PRIVACY_URL",
  "VITE_APP_TERMS_URL",
  "VITE_APP_NAV_VARIANT",
] as const;

export const clientBuildEnv: Record<string, string | undefined> = Object.fromEntries(
  ENV_KEYS.map((k) => [k, readRuntimeEnv(k)]),
) as Record<string, string | undefined>;

export const getConfig = (key: string, fallback?: string): string | undefined => {
  return clientBuildEnv[key] ?? fallback;
};

export const rolloutMode = getConfig("VITE_ROLLOUT_MODE", "MULTI_TENANT");
export const isMultiTenantMode = rolloutMode === "MULTI_TENANT";
export const isSingleTenantMode = rolloutMode === "SINGLE_TENANT";
export const isMultiTenant = isMultiTenantMode;
export const isSingleTenant = isSingleTenantMode;

export const isDemoMode = getConfig("VITE_DEMO_MODE", "false") === "true";
export const isMagicLinkEnabled = getConfig("VITE_ENABLE_MAGIC_LINK", "true") === "true";
export const paymentGatewayType = getConfig("VITE_PAYMENT_GATEWAY_TYPE", "STRIPE") as
  | "STRIPE"
  | "LEMON_SQUEEZY";

export const appTitle = getConfig("VITE_APP_TITLE", "Key Value")!;

export const appBrandName = (getConfig("VITE_APP_BRAND_NAME") ?? appTitle)!;

export const appBrandTagline = getConfig("VITE_APP_BRAND_TAGLINE", "Workspace")!;

export const authSectionLabel = getConfig(
  "VITE_APP_AUTH_SECTION_LABEL",
  "Trusted by teams worldwide",
)!;

export const authBadges = getConfig("VITE_APP_AUTH_BADGES", "SOC 2 Type II,GDPR Ready")!
  .split(",")
  .map((b) => b.trim())
  .filter(Boolean);

export const authHeadline1 = getConfig("VITE_APP_AUTH_HEADLINE_1", "Your workspace,")!;

export const authHeadline2 = getConfig("VITE_APP_AUTH_HEADLINE_2", "always in reach.")!;

export const authTagline = getConfig(
  "VITE_APP_AUTH_TAGLINE",
  "Manage your team, subscriptions, and settings — all from one place, secured by enterprise-grade authentication.",
)!;

export const onboardingWelcome = (getConfig("VITE_APP_ONBOARDING_WELCOME") ??
  `Welcome to ${appBrandName}!`)!;

export const footerCopyright = (getConfig("VITE_APP_FOOTER_COPYRIGHT") ??
  `© ${new Date().getFullYear()} ${appBrandName}. All rights reserved.`)!;

export const supportEmail = getConfig("VITE_APP_SUPPORT_EMAIL") ?? null;

export const supportUrl = getConfig("VITE_APP_SUPPORT_URL") ?? null;

export const privacyUrl = getConfig("VITE_APP_PRIVACY_URL") ?? null;

export const termsUrl = getConfig("VITE_APP_TERMS_URL") ?? null;

export const navVariant = getConfig("VITE_APP_NAV_VARIANT", "sidebar") as "sidebar" | "topbar";
