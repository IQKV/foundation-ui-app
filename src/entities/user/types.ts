import type { SortDirection } from "@/shared/types";

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

// ─── Avatar ───────────────────────────────────────────────────────────────────

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

// ─── Profile mutations ────────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  /** BCP 47 locale tag. Optional — omit to leave unchanged. */
  locale?: string | null;
}

// ─── Membership ───────────────────────────────────────────────────────────────

export interface UserMembership {
  tenantKey: string;
  tenantName: string;
  status: string;
  authorities: string[];
  isPersonal: boolean;
  isInternal: boolean;
}

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

// ─── Ban ──────────────────────────────────────────────────────────────────────

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

// ─── Stats ────────────────────────────────────────────────────────────────────

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
