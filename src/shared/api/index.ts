// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";

export { iamApi } from "./iam";
export type {
  UserProfile,
  UserStatus,
  UpdateProfileRequest,
  UserMembership,
  Tenant,
  TenantStatus,
  TenantMember,
  MemberStatus,
  ListMembersParams,
  Invitation,
  InvitationStatus,
  InvitationAuthority,
  SendInvitationRequest,
  InvitationPreview,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  SortDirection,
  PagedResponse,
  UpdateTenantRequest,
  UpdateTenantStatusRequest,
  UpdateMemberAuthoritiesRequest,
  MemberAuthoritiesResponse,
  BanUserRequest,
  BanResponse,
} from "./iam";

export { localesApi } from "./iam";
export type { IamLocale } from "./iam";

export { cmsApi } from "./cms";
export type {
  CmsPage,
  CmsPageSummary,
  CmsPageSummaryListResponse,
  CmsPageStatus,
  CmsPageTranslation,
  CmsPageTranslationRequest,
  CreateCmsPageRequest,
  UpdateCmsPageRequest,
  ListCmsPageParams,
  CmsPageHierarchyItem,
} from "./cms";

export { authApi } from "./auth";
export type {
  SignInRequest,
  SignInResponse,
  TenantMembershipSummary,
  TenantExchangeRequest,
  SignupStatusResponse,
  ProvisioningStatus,
} from "./auth";

export { passwordResetApi } from "./password-reset";
export type { ForgotPasswordRequest, ResetPasswordRequest } from "./password-reset";

export { signupApi } from "./signup";
export type { RegisterUserRequest, SignupResponse } from "./signup";

export { billingApi } from "./billing";
export type {
  PortalSessionResponse,
  Plan,
  SubscriptionResponse,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  BillingSettingsResponse,
  CreateBillingSettingsRequest,
  UpdateBillingSettingsRequest,
  RefundResponse,
  PlanFeature,
  PlanFeatures,
  EntitlementsResponse,
} from "./billing";

export { notificationApi } from "./iam";
export type {
  UserNotification,
  UserNotificationListResponse,
  UnreadCountResponse,
  NotificationPatchRequest,
} from "./iam";
