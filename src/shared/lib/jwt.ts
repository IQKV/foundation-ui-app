import { jwtDecode } from "jwt-decode";

export interface AdminJwtPayload {
  sub: string;
  authorities: string[];
  exp: number;
  iat: number;
}

/**
 * Decode a JWT and return the payload, or null if the token is malformed
 * or cannot be decoded for any reason.
 */
export function decodeJwt(token: string): AdminJwtPayload | null {
  try {
    return jwtDecode<AdminJwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Return true if the decoded payload contains the PLATFORM_ADMIN authority.
 */
export function hasPlatformAdmin(payload: AdminJwtPayload): boolean {
  return payload.authorities.includes("PLATFORM_ADMIN");
}
