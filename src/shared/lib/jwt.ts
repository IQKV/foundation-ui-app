import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tenant_id: string | null;
  authorities: string[];
  email_verified: boolean;
  exp: number;
  iat: number;
}

/**
 * Decode a JWT and return the payload, or null if the token is malformed
 * or cannot be decoded for any reason.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Return true if the decoded payload belongs to an authenticated tenant session
 * (non-null tenant_id and at least one authority).
 */
export function isTenantSession(payload: JwtPayload): boolean {
  return payload.tenant_id !== null && payload.authorities.length > 0;
}

/**
 * Return true if the payload carries the TENANT_OWNER authority.
 */
export function isTenantOwner(payload: JwtPayload): boolean {
  return payload.authorities.includes("TENANT_OWNER");
}
