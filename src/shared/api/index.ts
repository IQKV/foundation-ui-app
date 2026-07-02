// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";

// ─── IAM ──────────────────────────────────────────────────────────────────────

export { iamApi, localesApi, notificationApi } from "./iam";
export type { IamLocale, SortDirection } from "./iam";

// Entity types — re-exported via the iam module shim for backward compatibility.
export type {
  UserProfile,
  UserStatus,
  UpdateProfileRequest,
  AvatarUploadInitResponse,
  AvatarConfirmRequest,
  AvatarResponse,
  UserMembership,
  MemberStatus,
  TenantMember,
  ListMembersParams,
  UpdateMemberAuthoritiesRequest,
  MemberAuthoritiesResponse,
  BanUserRequest,
  BanResponse,
  UserSignupSeriesPoint,
  TenantUserStatsResponse,
  TenantUserStatsParams,
} from "./iam";

export type {
  Tenant,
  TenantStatus,
  CreateTenantRequest,
  CreateTenantResponse,
  UpdateTenantRequest,
  UpdateTenantStatusRequest,
  TenantSsoConfigResponse,
  TenantSsoConfigRequest,
} from "./iam";

export type {
  Invitation,
  InvitationStatus,
  InvitationAuthority,
  InvitationPreview,
  SendInvitationRequest,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
} from "./iam";

export type {
  UserNotification,
  UserNotificationListResponse,
  UnreadCountResponse,
  NotificationPatchRequest,
} from "./iam";

export type { PagedResponse } from "./iam";

// ─── CMS ──────────────────────────────────────────────────────────────────────

export { cmsApi } from "./cms";
export type {
  CmsPage,
  CmsPageStatus,
  CmsPageSummary,
  CmsPageSummaryListResponse,
  CmsPageTranslation,
  CmsPageTranslationRequest,
  CmsPageHierarchyItem,
  CreateCmsPageRequest,
  UpdateCmsPageRequest,
  ListCmsPageParams,
} from "./cms";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export { authApi } from "./auth";
export type {
  SignInRequest,
  SignInResponse,
  TenantMembershipSummary,
  TenantExchangeRequest,
  SignupStatusResponse,
  ProvisioningStatus,
  MagicLinkInitiateRequest,
  MagicLinkExchangeRequest,
  MagicLinkResponse,
} from "./auth";

// ─── OAuth2 / OIDC ────────────────────────────────────────────────────────────

export { oauth2Api, buildOAuth2AuthorizeUrl, resolveApiUrl } from "./oauth2";
export type {
  OAuth2EnabledProvidersResponse,
  OAuth2LinkedIdentity,
  OAuth2AuthorizationUrlResponse,
} from "./oauth2";

// ─── Password reset ───────────────────────────────────────────────────────────

export { passwordResetApi } from "./password-reset";
export type { ForgotPasswordRequest, ResetPasswordRequest } from "./password-reset";

// ─── Signup ───────────────────────────────────────────────────────────────────

export { signupApi } from "./signup";
export type { RegisterUserRequest, SignupResponse } from "./signup";

// ─── Billing ─────────────────────────────────────────────────────────────────

export { billingApi } from "./billing";
export type {
  Plan,
  PricingModel,
  PlanFeature,
  PlanEntitlement,
  SubscriptionResponse,
  EntitlementsResponse,
  BillingSettingsResponse,
  RefundResponse,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  PortalSessionResponse,
  CreateBillingSettingsRequest,
  UpdateBillingSettingsRequest,
} from "./billing";
