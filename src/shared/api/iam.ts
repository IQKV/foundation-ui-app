import { httpClient } from "./http-client";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ─── User types ───────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailVerified: boolean;
  /** BCP 47 locale tag (e.g. "en-US"). Null when not yet set. */
  locale: string | null;
  /** Public URL of the user's avatar image. Null when no avatar has been uploaded. */
  avatarUrl: string | null;
  /** ISO-8601 timestamp of the user's first sign-in. Null if they haven't signed in yet. */
  firstSignInAt: string | null;
  /** Whether the user has completed the welcome onboarding flow. */
  onboardingCompleted: boolean;
  /** Whether the user has completed initial profile setup (name fields populated). */
  profileCompleted: boolean;
  /** Tenant names the user belongs to (aggregated server-side). */
  organizations: string[];
  /** Membership-level authorities across all tenants (e.g. TENANT_OWNER, ADMIN, MEMBER). */
  membershipAuthorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AvatarUploadInitResponse {
  presignedUploadUrl: string;
  objectKey: string;
  expiresInMinutes: number;
}

export interface AvatarConfirmRequest {
  objectKey: string;
}

export interface AvatarResponse {
  avatarUrl: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  /** BCP 47 locale tag. Optional — omit to leave unchanged. */
  locale?: string | null;
}

export interface UserMembership {
  tenantKey: string;
  tenantName: string;
  status: string;
  authorities: string[];
  isPersonal: boolean;
  isInternal: boolean;
}

// ─── Tenant types ─────────────────────────────────────────────────────────────

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface Tenant {
  id: string;
  tenantKey: string;
  name: string;
  status: TenantStatus;
  /** True when this is the user's personal workspace. */
  isPersonal: boolean;
  /** True when this is an internal platform workspace (e.g. the reserved platform tenant). */
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantRequest {
  name: string;
}

export interface UpdateTenantStatusRequest {
  status: TenantStatus;
}

export interface CreateTenantRequest {
  name: string;
}

export interface CreateTenantResponse {
  id: string;
  tenantKey: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Member types ─────────────────────────────────────────────────────────────

export type MemberStatus = "ACTIVE" | "SUSPENDED" | "REMOVED";

export interface TenantMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  membershipStatus: MemberStatus;
  tenantAuthorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListMembersParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: "firstName" | "email" | "createdAt";
  sortDir?: SortDirection;
}

export interface UpdateMemberAuthoritiesRequest {
  authorities: string[];
}

export interface MemberAuthoritiesResponse {
  userId: string;
  tenantKey: string;
  authorities: string[];
}

// ─── Ban types ─────────────────────────────────────────────────────────────────

export interface BanUserRequest {
  reason?: string;
  expiresAt?: string;
}

export interface BanResponse {
  id: string;
  userId: string;
  initiatorId: string;
  type: "PLATFORM" | "TENANT";
  tenantKey?: string;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Invitation types ─────────────────────────────────────────────────────────

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type InvitationAuthority = "ADMIN" | "MEMBER";

export interface Invitation {
  invitationId: string;
  email: string;
  tenantKey: string;
  authority: InvitationAuthority;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface SendInvitationRequest {
  email: string;
  authority?: InvitationAuthority;
}

// ─── Invitation accept flow (public — no auth required) ───────────────────────

export interface InvitationPreview {
  invitationId: string;
  tenantName: string;
  email: string;
  authority: string;
  expiresAt: string;
  /** True when the invited email has no account yet — new user must provide name + password. */
  requiresSignup: boolean;
}

export interface AcceptInvitationRequest {
  password: string;
  /** Required only when requiresSignup is true. */
  firstName?: string;
  /** Required only when requiresSignup is true. */
  lastName?: string;
}

export interface AcceptInvitationResponse {
  accessToken: string;
  refreshToken: string;
  tenantKey: string;
}

// ─── Tenant user stats types ──────────────────────────────────────────────────

export interface UserSignupSeriesPoint {
  period: string;
  signups: number;
}

export interface TenantUserStatsResponse {
  tenantKey: string;
  totalMembers: number;
  activeMembers: number;
  lockedMembers: number;
  suspendedMembers: number;
  emailVerifiedCount: number;
  signupSeries: UserSignupSeriesPoint[];
  periodFrom: string;
  periodTo: string;
  granularity: "day" | "month";
}

export interface TenantUserStatsParams {
  from?: string;
  to?: string;
  granularity?: "day" | "month";
}

// ─── API ──────────────────────────────────────────────────────────────────────

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

  // ── Members (TENANT_OWNER / ADMIN / MEMBER) ──────────────────────────────

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

  // ── Invitation accept flow (public — no JWT / X-Tenant-ID required) ────────

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

// ─── Notification types ───────────────────────────────────────────────────────

export interface UserNotification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string | null;
  /** Raw JSON string — use JSON.parse if you need the object. */
  payload: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface UserNotificationListResponse {
  items: UserNotification[];
  totalElements: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPatchRequest {
  isRead: boolean;
}

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
