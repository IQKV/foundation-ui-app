import { useSessionStore } from "./session.store";
import { decodeJwt, isTenantOwner as checkTenantOwner, isTenantSession } from "@/shared/lib/jwt";
import type { JwtPayload } from "@/shared/lib/jwt";

export interface UseSessionResult {
  /**
   * True while the app has a persisted refresh token but no in-memory access
   * token yet — i.e. the silent-refresh in the route guard is still in flight.
   * Use this to show a loading indicator instead of flashing unauthorized UI.
   */
  isLoading: boolean;
  /** True once the access token is in memory and the session is a valid tenant session. */
  isAuthenticated: boolean;
  /** True if the authenticated user holds the TENANT_OWNER authority. */
  isTenantOwner: boolean;
  /**
   * True when the active workspace is the user's personal workspace.
   *
   * Source of truth: backend `Tenant.isInternal`, surfaced as
   * `TenantMembershipSummary.isPersonal` at sign-in time and persisted in
   * sessionStorage. The JWT carries no workspace-type claim.
   */
  isPersonalWorkspace: boolean;
  /** Decoded JWT payload, or null when not authenticated / still loading. */
  payload: JwtPayload | null;
  /** Active tenant key from the session store. */
  tenantKey: string | null;
}

// Unauthenticated shape — returned whenever there is no valid token.
const unauthenticated = (isLoading: boolean, tenantKey: string | null): UseSessionResult => ({
  isLoading,
  isAuthenticated: false,
  isTenantOwner: false,
  isPersonalWorkspace: false,
  payload: null,
  tenantKey,
});

/**
 * Reactive hook that exposes the current session state derived from the
 * in-memory access token and the persisted session metadata.
 *
 * `isLoading` is true when a refresh token exists in sessionStorage but the
 * access token has not yet been written to the store — this is the window
 * between page load and the completion of the silent-refresh in the route
 * guard's `beforeLoad`. Rendering a spinner during this window prevents
 * flashing unauthorized content.
 *
 * `isPersonalWorkspace` is read from sessionStorage (written at sign-in and
 * tenant-switch time) because the JWT carries no workspace-type claim.
 * It reflects `Tenant.isInternal` from the backend — internal tenants are
 * presented to users as their personal workspace.
 *
 * @example
 * ```tsx
 * const { isLoading, isAuthenticated, isPersonalWorkspace, isTenantOwner } = useSession();
 * if (isLoading) return <Loader />;
 * if (!isAuthenticated) return null;
 * if (isPersonalWorkspace) return <PersonalDashboard />;
 * return <OrganizationDashboard />;
 * ```
 */
export function useSession(): UseSessionResult {
  const accessToken = useSessionStore((s) => s.accessToken);
  const refreshToken = useSessionStore((s) => s.refreshToken);
  const tenantKey = useSessionStore((s) => s.tenantKey);
  const isPersonalWorkspace = useSessionStore((s) => s.isPersonalWorkspace);

  // Still waiting for the silent-refresh to complete.
  const isLoading = !accessToken && (!!refreshToken || !!tenantKey);

  if (!accessToken) {
    return unauthenticated(isLoading, tenantKey);
  }

  const payload = decodeJwt(accessToken);

  if (!payload || !isTenantSession(payload)) {
    return unauthenticated(false, tenantKey);
  }

  return {
    isLoading: false,
    isAuthenticated: true,
    isTenantOwner: checkTenantOwner(payload),
    isPersonalWorkspace,
    payload,
    tenantKey,
  };
}
