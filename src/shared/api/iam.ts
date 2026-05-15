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
};
