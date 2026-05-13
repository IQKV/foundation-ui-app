// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";

export { iamApi } from "./iam";
export type {
  UserProfile,
  UpdateProfileRequest,
  Tenant,
  TenantStatus,
  TenantMember,
  MemberStatus,
  ListMembersParams,
  Invitation,
  SendInvitationRequest,
  SortDirection,
  PagedResponse,
} from "./iam";

export { authApi } from "./auth";
export type { SignInRequest, SignInResponse, TenantMembershipSummary } from "./auth";

export { passwordResetApi } from "./password-reset";
export type { ForgotPasswordRequest, ResetPasswordRequest } from "./password-reset";
