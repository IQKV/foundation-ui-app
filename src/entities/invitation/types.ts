export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type InvitationAuthority = "ADMIN" | "MEMBER";

export interface Invitation {
  invitationId: string;
  tenantKey: string;
  email: string;
  authority: InvitationAuthority;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationPreview {
  invitationId: string;
  tenantName: string;
  email: string;
  authority: string;
  expiresAt: string;
  /** True when the invited email has no account yet — new user must provide name + password. */
  requiresSignup: boolean;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface SendInvitationRequest {
  email: string;
  authority?: InvitationAuthority;
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
