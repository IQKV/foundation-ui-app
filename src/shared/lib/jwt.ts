import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  sub: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  /**
   * The active tenant key, or null for admin/platform-scoped tokens that
   * carry no tenant context.
   */
  tenant_id: string | null;
  authorities: string[];
  email_verified: boolean;
  onboarding_completed: boolean;
  profile_completed: boolean;
  exp: number;
  iat: number;
}

/**
 * Decode a JWT and return the payload, or null if the token is malformed
 * or cannot be decoded for any reason.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const decoded = jwtDecode<Record<string, unknown>>(token);
    return {
      sub: decoded.sub as string,
      user_id: decoded.user_id as string,
      email: decoded.email as string,
      first_name: decoded.first_name as string,
      last_name: decoded.last_name as string,
      tenant_id: decoded.tenant_id as string | null,
      authorities: decoded.authorities as string[],
      email_verified: decoded.email_verified as boolean,
      onboarding_completed: decoded.onboarding_completed as boolean,
      profile_completed: decoded.profile_completed as boolean,
      exp: decoded.exp as number,
      iat: decoded.iat as number,
    };
  } catch {
    return null;
  }
}

/**
 * Return true if the decoded payload belongs to an authenticated tenant session
 * (non-null tenant_id).
 */
export function isTenantSession(payload: JwtPayload): boolean {
  return payload.tenant_id !== null;
}

/**
 * Return true if the payload carries the TENANT_OWNER authority.
 */
export function isTenantOwner(payload: JwtPayload): boolean {
  return payload.authorities.includes("TENANT_OWNER");
}

/**
 * Return true if the payload carries either TENANT_OWNER or PLATFORM_ADMIN authority.
 */
export function canManageTenantSso(payload: JwtPayload): boolean {
  return (
    payload.authorities.includes("TENANT_OWNER") || payload.authorities.includes("PLATFORM_ADMIN")
  );
}
