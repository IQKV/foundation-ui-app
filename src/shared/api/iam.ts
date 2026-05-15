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
  /** Tenant names the user belongs to (aggregated server-side). */
  organizations: string[];
  /** Membership-level authorities across all tenants (e.g. TENANT_OWNER, ADMIN, MEMBER). */
  membershipAuthorities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

// ─── Tenant types ─────────────────────────────────────────────────────────────

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface Tenant {
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
  authorities: string[];
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

// ─── API ──────────────────────────────────────────────────────────────────────

export const iamApi = {
  // ── Self-service user ──────────────────────────────────────────────────────

  /** Get the current user's own profile. */
  getMe: () => httpClient.get<UserProfile>("/v1/iam/users/me").then((r) => r.data),

  /** Update the current user's own profile. */
  updateMe: (data: UpdateProfileRequest) =>
    httpClient.patch<UserProfile>("/v1/iam/users/me", data).then((r) => r.data),

  // ── Tenant (TENANT_OWNER only) ─────────────────────────────────────────────

  /** Get the current tenant's details. */
  getTenant: (tenantKey: string) =>
    httpClient.get<Tenant>(`/v1/iam/tenants/${tenantKey}`).then((r) => r.data),

  // ── Members (TENANT_OWNER / ADMIN) ────────────────────────────────────────

  /** List members of the current tenant. */
  listMembers: (tenantKey: string, params: ListMembersParams = {}) =>
    httpClient
      .get<PagedResponse<TenantMember>>(`/v1/iam/admin/tenants/${tenantKey}/members`, { params })
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
