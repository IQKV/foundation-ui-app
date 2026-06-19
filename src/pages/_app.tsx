import { createFileRoute, isRedirect, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Center, Loader } from "@mantine/core";
import { AppLayout } from "@/shared/ui";
import { httpClient } from "@/shared/api/http-client";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { authApi } from "@/shared/api/auth";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getTenantKey,
  getIsPersonalWorkspace,
  setTokens,
  useSession,
} from "@/processes/session";
import { useInactivityTimer } from "@/processes/inactivity-timer";
import { EntitlementsProvider } from "@/features/manage-billing";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_app")({
  /**
   * Route guard — runs before the layout and all authenticated child routes render.
   *
   * Two paths through the guard:
   *
   * 1. No access token → attempt silent refresh using the persisted refresh
   *    token + tenant key from sessionStorage.
   *    - Refresh succeeds + valid tenant session → store token, allow navigation.
   *    - Refresh succeeds + invalid session      → clear session, redirect /sign-in?reason=forbidden.
   *    - Refresh fails (any error)               → clear session, redirect /sign-in?redirect=<path>.
   *
   * 2. Access token already in store → decode and check it is a tenant session.
   *    - Malformed / null payload  → clear session, redirect /sign-in.
   *    - Not a tenant session      → redirect /unauthorized.
   *    - Valid tenant session      → allow navigation (no network request).
   */
  beforeLoad: async ({ location }) => {
    const token = getAccessToken();

    if (!token) {
      // ── Path 1: no token — attempt silent refresh ──────────────────────────
      const refreshToken = getRefreshToken();
      const tenantKey = getTenantKey();

      if (!refreshToken || !tenantKey) {
        throw redirect({ to: "/sign-in", search: { redirect: location.href } });
      }

      try {
        const { data } = await httpClient.post<{
          accessToken: string;
          refreshToken: string;
          tenantKey: string;
        }>("/v1/iam/auth/refresh", { refreshToken }, { headers: { "X-Tenant-ID": tenantKey } });

        setTokens(data.accessToken, data.refreshToken, data.tenantKey, getIsPersonalWorkspace());

        const payload = decodeJwt(data.accessToken);
        if (!payload || !isTenantSession(payload)) {
          clearSession();
          throw redirect({ to: "/sign-in", search: { reason: "forbidden" } });
        }
        return;
      } catch (err) {
        if (isRedirect(err)) throw err;
        clearSession();
        throw redirect({ to: "/sign-in", search: { redirect: location.href } });
      }
    }

    // ── Path 2: token already in store ────────────────────────────────────────
    const payload = decodeJwt(token);

    if (!payload) {
      clearSession();
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }

    if (!isTenantSession(payload)) {
      clearSession();
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }
  },

  component: AppLayoutRoute,
});

// ─── Layout component ─────────────────────────────────────────────────────────

/**
 * Wraps all authenticated routes.
 * Mounts the inactivity timer for the entire tenant session.
 * Shows a full-screen spinner while the silent-refresh is in flight to
 * prevent flashing unauthorized content on page reload.
 */
function AppLayoutRoute() {
  const navigate = useNavigate();
  const { isLoading } = useSession();

  useInactivityTimer({
    onTimeout: () => {
      void authApi.signOut().catch(() => {});
      clearSession();
      void navigate({ to: "/sign-in", search: { reason: "timeout" } });
    },
  });

  if (isLoading) {
    return (
      <Center mih="100vh" data-testid="app-auth-loading">
        <Loader size="md" />
      </Center>
    );
  }

  return (
    <EntitlementsProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </EntitlementsProvider>
  );
}
