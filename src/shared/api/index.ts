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
} from "./iam";

export { authApi } from "./auth";
export type {
  SignInRequest,
  SignInResponse,
  TenantMembershipSummary,
  TenantExchangeRequest,
} from "./auth";

export { passwordResetApi } from "./password-reset";
export type { ForgotPasswordRequest, ResetPasswordRequest } from "./password-reset";

export { signupApi } from "./signup";
export type {
  RegisterUserRequest,
  SignupResponse,
  SignupStatusResponse,
  ProvisioningStatus,
} from "./signup";

export { billingApi } from "./billing";
export type { PortalSessionResponse } from "./billing";
