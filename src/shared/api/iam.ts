import { httpClient } from "./http-client";
import type { PagedResponse } from "@/shared/types";
import type {
  UserProfile,
  AvatarUploadInitResponse,
  AvatarConfirmRequest,
  AvatarResponse,
  UpdateProfileRequest,
  UserMembership,
  TenantMember,
  MemberStatus,
  ListMembersParams,
  UpdateMemberAuthoritiesRequest,
  MemberAuthoritiesResponse,
  BanUserRequest,
  BanResponse,
  UserSignupSeriesPoint,
  TenantUserStatsResponse,
  TenantUserStatsParams,
} from "@/entities/user";
import type { UserStatus } from "@/entities/user";
import type {
  Tenant,
  TenantStatus,
  CreateTenantRequest,
  CreateTenantResponse,
  UpdateTenantRequest,
  UpdateTenantStatusRequest,
} from "@/entities/tenant";
import type {
  Invitation,
  InvitationStatus,
  InvitationAuthority,
  InvitationPreview,
  SendInvitationRequest,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
} from "@/entities/invitation";
import type {
  UserNotification,
  UserNotificationListResponse,
  UnreadCountResponse,
  NotificationPatchRequest,
} from "@/entities/notification";

// Re-export entity types so existing imports from "@/shared/api" keep working.
export type { PagedResponse };
export type {
  UserStatus,
  UserProfile,
  AvatarUploadInitResponse,
  AvatarConfirmRequest,
  AvatarResponse,
  UpdateProfileRequest,
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
};
export type {
  Tenant,
  TenantStatus,
  CreateTenantRequest,
  CreateTenantResponse,
  UpdateTenantRequest,
  UpdateTenantStatusRequest,
};

export interface TenantSsoConfigResponse {
  providerKey: string;
  displayName: string;
  issuerUri: string;
  clientId: string;
  scopes: string;
  enabled: boolean;
  hasClientSecret: boolean;
}

export interface TenantSsoConfigRequest {
  displayName: string;
  issuerUri: string;
  clientId: string;
  clientSecret?: string;
  scopes: string;
  enabled: boolean;
}
export type {
  Invitation,
  InvitationStatus,
  InvitationAuthority,
  InvitationPreview,
  SendInvitationRequest,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
};
export type {
  UserNotification,
  UserNotificationListResponse,
  UnreadCountResponse,
  NotificationPatchRequest,
};

// ─── Shared query helpers ─────────────────────────────────────────────────────

export type { SortDirection } from "@/shared/types";

// ─── IAM API ──────────────────────────────────────────────────────────────────

export const iamApi = {
  // ── Self-service user ──────────────────────────────────────────────────────

  /** Get the current user's own profile. */
  getMe: () => httpClient.get<UserProfile>("/v1/iam/users/me").then((r) => r.data),

  /** List current user's tenant memberships across all tenants. */
  listMyMemberships: () =>
    httpClient.get<UserMembership[]>("/v1/iam/users/me/memberships").then((r) => r.data),

  /** Update the current user's own profile. */
  updateMe: (data: UpdateProfileRequest) =>
    httpClient.patch<UserProfile>("/v1/iam/users/me", data).then((r) => r.data),

  /** Change the current user's own password (requires current password for re-authentication). */
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<void> =>
    httpClient.post("/v1/iam/users/me/password", data).then(() => undefined),

  /** Initiate avatar upload — get presigned PUT URL. */
  initiateAvatarUpload: () =>
    httpClient.post<AvatarUploadInitResponse>("/v1/iam/users/me/avatar").then((r) => r.data),

  /** Confirm avatar upload after file is uploaded to S3. */
  confirmAvatarUpload: (data: AvatarConfirmRequest) =>
    httpClient.post<AvatarResponse>("/v1/iam/users/me/avatar/confirm", data).then((r) => r.data),

  /** Delete user's avatar. */
  deleteAvatar: (): Promise<void> =>
    httpClient.delete("/v1/iam/users/me/avatar").then(() => undefined),

  /** Mark profile setup as completed. */
  completeProfile: (): Promise<void> =>
    httpClient.post("/v1/iam/users/me/profile/complete").then(() => undefined),

  /** Mark onboarding as completed. */
  completeOnboarding: (): Promise<void> =>
    httpClient.post("/v1/iam/users/me/onboarding/complete").then(() => undefined),

  // ── Tenant (TENANT_OWNER / ADMIN / MEMBER) ────────────────────────────────

  /** Create a new tenant. Requires authentication. */
  createTenant: (data: CreateTenantRequest) =>
    httpClient.post<CreateTenantResponse>("/v1/iam/tenants", data).then((r) => r.data),

  /** Get the current tenant's details. */
  getTenant: (tenantKey: string) =>
    httpClient.get<Tenant>(`/v1/iam/tenants/${tenantKey}`).then((r) => r.data),

  /** Update the current tenant's name (rename). */
  updateTenant: (tenantKey: string, data: UpdateTenantRequest) =>
    httpClient.patch<Tenant>(`/v1/iam/tenants/${tenantKey}`, data).then((r) => r.data),

  /** Update the current tenant's status. */
  updateTenantStatus: (tenantKey: string, data: UpdateTenantStatusRequest) =>
    httpClient.patch<Tenant>(`/v1/iam/tenants/${tenantKey}/status`, data).then((r) => r.data),

  /** Retry tenant provisioning. */
  retryProvisioning: (tenantKey: string) =>
    httpClient.post<Tenant>(`/v1/iam/tenants/${tenantKey}/retry-provisioning`).then((r) => r.data),

  getTenantSsoConfig: () =>
    httpClient.get<TenantSsoConfigResponse | null>("/v1/iam/tenants/sso").then((r) => r.data),

  updateTenantSsoConfig: (data: TenantSsoConfigRequest): Promise<void> =>
    httpClient.put("/v1/iam/tenants/sso", data).then(() => undefined),

  deleteTenantSsoConfig: (): Promise<void> =>
    httpClient.delete("/v1/iam/tenants/sso").then(() => undefined),

  // ── Members (TENANT_OWNER / ADMIN / MEMBER) ───────────────────────────────

  /** List members of the current tenant. */
  listMembers: (tenantKey: string, params: ListMembersParams = {}) =>
    httpClient
      .get<PagedResponse<TenantMember>>(`/v1/iam/tenants/${tenantKey}/members`, { params })
      .then((r) => r.data),

  /** Update a tenant member's authorities. */
  updateMemberAuthorities: (
    tenantKey: string,
    userId: string,
    data: UpdateMemberAuthoritiesRequest,
  ) =>
    httpClient
      .put<MemberAuthoritiesResponse>(
        `/v1/iam/tenants/${tenantKey}/members/${userId}/authorities`,
        data,
      )
      .then((r) => r.data),

  /** Remove a member from the tenant. */
  removeMember: (tenantKey: string, userId: string) =>
    httpClient.delete(`/v1/iam/tenants/${tenantKey}/members/${userId}`),

  /** Get member count for the current tenant. */
  countMembers: (tenantKey: string) =>
    httpClient
      .get<{ tenantKey: string; count: number }>(`/v1/iam/tenants/${tenantKey}/members/count`)
      .then((r) => r.data),

  /** Ban a member from the tenant (TENANT_OWNER only). */
  banMember: (tenantKey: string, userId: string, data: BanUserRequest = {}) =>
    httpClient
      .post<BanResponse>(`/v1/iam/tenants/${tenantKey}/members/${userId}/ban`, data)
      .then((r) => r.data),

  /** Unban a member from the tenant (TENANT_OWNER only). */
  unbanMember: (tenantKey: string, userId: string) =>
    httpClient.post(`/v1/iam/tenants/${tenantKey}/members/${userId}/unban`),

  /** Transfer tenant ownership to another member (TENANT_OWNER only). */
  transferOwnership: (tenantKey: string, userId: string) =>
    httpClient
      .post<MemberAuthoritiesResponse>(
        `/v1/iam/tenants/${tenantKey}/members/${userId}/transfer-ownership`,
      )
      .then((r) => r.data),

  // ── Tenant user stats (TENANT_OWNER / ADMIN) ──────────────────────────────

  /**
   * Returns aggregated user statistics for a tenant: member counts by status,
   * email-verified count, and a time-bucketed signup series for the dashboard chart.
   * Requires TENANT_OWNER or ADMIN authority.
   */
  getTenantUserStats: (tenantKey: string, params: TenantUserStatsParams = {}) =>
    httpClient
      .get<TenantUserStatsResponse>(`/v1/iam/tenants/${tenantKey}/members/stats`, { params })
      .then((r) => r.data),

  // ── Invitations (TENANT_OWNER / ADMIN) ────────────────────────────────────

  /** List pending invitations for the current tenant. */
  listInvitations: (tenantKey: string) =>
    httpClient.get<Invitation[]>(`/v1/iam/tenants/${tenantKey}/invitations`).then((r) => r.data),

  /** Send an invitation to a new member. */
  sendInvitation: (tenantKey: string, data: SendInvitationRequest) =>
    httpClient
      .post<Invitation>(`/v1/iam/tenants/${tenantKey}/invitations`, data)
      .then((r) => r.data),

  /** Revoke a pending invitation. */
  revokeInvitation: (tenantKey: string, invitationId: string) =>
    httpClient.delete(`/v1/iam/tenants/${tenantKey}/invitations/${invitationId}`),

  // ── Invitation accept flow (public — no JWT / X-Tenant-ID required) ───────

  /**
   * Preview an invitation by token.
   * Returns tenant name, invited email, authority, expiry, and requiresSignup flag.
   * 404 when the token is expired, revoked, or not found.
   */
  previewInvitation: (token: string) =>
    httpClient.get<InvitationPreview>(`/v1/iam/invitations/${token}`).then((r) => r.data),

  /**
   * Accept an invitation.
   * For new users (requiresSignup=true): firstName, lastName, and password required.
   * For existing users (requiresSignup=false): only password required.
   * Returns a token pair scoped to the invited tenant — user is immediately signed in.
   */
  acceptInvitation: (token: string, data: AcceptInvitationRequest) =>
    httpClient
      .post<AcceptInvitationResponse>(`/v1/iam/invitations/${token}/accept`, data)
      .then((r) => r.data),
};

// ─── Locales ──────────────────────────────────────────────────────────────────

export interface IamLocale {
  code: string;
  name: string;
  nativeName: string | null;
  isDefault: boolean;
}

/** GET /v1/iam/locales — public, returns all active locales ordered by default first. */
export const localesApi = {
  list: () => httpClient.get<IamLocale[]>("/v1/iam/locales").then((r) => r.data),
};

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationApi = {
  /** GET /v1/iam/users/notifications — paginated list with optional isRead filter. */
  list: (params: { limit?: number; offset?: number; isRead?: boolean } = {}) =>
    httpClient
      .get<UserNotificationListResponse>("/v1/iam/users/notifications", { params })
      .then((r) => r.data),

  /** GET /v1/iam/users/notifications/unread/count — badge count. */
  unreadCount: () =>
    httpClient
      .get<UnreadCountResponse>("/v1/iam/users/notifications/unread/count")
      .then((r) => r.data),

  /** PATCH /v1/iam/users/notifications/{id} — mark single as read. */
  patch: (id: string, data: NotificationPatchRequest) =>
    httpClient.patch(`/v1/iam/users/notifications/${id}`, data),

  /** PATCH /v1/iam/users/notifications — bulk update (mark all as read). */
  patchAll: (data: NotificationPatchRequest) =>
    httpClient.patch("/v1/iam/users/notifications", data),

  /** DELETE /v1/iam/users/notifications/{id} — delete single. */
  deleteOne: (id: string) => httpClient.delete(`/v1/iam/users/notifications/${id}`),

  /** DELETE /v1/iam/users/notifications — delete all. */
  deleteAll: () => httpClient.delete("/v1/iam/users/notifications"),
};
