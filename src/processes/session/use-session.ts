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
  /** Decoded JWT payload, or null when not authenticated / still loading. */
  payload: JwtPayload | null;
  /** Active tenant key from the session store. */
  tenantKey: string | null;
}

/**
 * Reactive hook that exposes the current session state derived from the
 * in-memory access token.
 *
 * `isLoading` is true when a refresh token exists in sessionStorage but the
 * access token has not yet been written to the store — this is the window
 * between page load and the completion of the silent-refresh in the route
 * guard's `beforeLoad`. Rendering a spinner during this window prevents
 * flashing unauthorized content.
 *
 * @example
 * ```tsx
 * const { isLoading, isAuthenticated, isTenantOwner } = useSession();
 * if (isLoading) return <Loader />;
 * if (!isAuthenticated) return null;
 * if (isTenantOwner) return <OwnerPanel />;
 * return <MemberPanel />;
 * ```
 */
export function useSession(): UseSessionResult {
  const accessToken = useSessionStore((s) => s.accessToken);
  const refreshToken = useSessionStore((s) => s.refreshToken);
  const tenantKey = useSessionStore((s) => s.tenantKey);

  // Still waiting for the silent-refresh to complete.
  const isLoading = !accessToken && (!!refreshToken || !!tenantKey);

  if (!accessToken) {
    return { isLoading, isAuthenticated: false, isTenantOwner: false, payload: null, tenantKey };
  }

  const payload = decodeJwt(accessToken);

  if (!payload || !isTenantSession(payload)) {
    return {
      isLoading: false,
      isAuthenticated: false,
      isTenantOwner: false,
      payload: null,
      tenantKey,
    };
  }

  return {
    isLoading: false,
    isAuthenticated: true,
    isTenantOwner: checkTenantOwner(payload),
    payload,
    tenantKey,
  };
}
