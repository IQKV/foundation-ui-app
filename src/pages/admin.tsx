import { createFileRoute, isRedirect, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/shared/ui";
import { httpClient } from "@/shared/api/http-client";
import { decodeJwt, hasPlatformAdmin } from "@/shared/lib/jwt";
import { authApi } from "@/shared/api/auth";
import { clearSession, getAccessToken, getRefreshToken, setTokens } from "@/processes/session";
import { useInactivityTimer } from "@/processes/inactivity-timer";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin")({
  /**
   * Route guard — runs before any /admin/* route renders.
   *
   * Two paths through the guard:
   *
   * 1. No token in store → attempt silent refresh via the httpOnly cookie.
   *    - Refresh succeeds + PLATFORM_ADMIN  → store token, allow navigation.
   *    - Refresh succeeds + no PLATFORM_ADMIN → clear session, redirect /sign-in?reason=forbidden.
   *    - Refresh fails (any error)           → clear session, redirect /sign-in?redirect=<path>.
   *
   * 2. Token already in store → decode and check authority.
   *    - Malformed / null payload → clear session, redirect /sign-in?redirect=<path>.
   *    - No PLATFORM_ADMIN       → redirect /unauthorized.
   *    - Has PLATFORM_ADMIN      → allow navigation (no network request).
   *
   * Requirements: 2.1–2.6, 3.1–3.7
   */
  beforeLoad: async ({ location }) => {
    const token = getAccessToken();

    if (!token) {
      // ── Path 1: no token — attempt silent refresh ──────────────────────────
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token available — redirect to sign-in.
        throw redirect({ to: "/sign-in", search: { redirect: location.href } });
      }

      try {
        const { data } = await httpClient.post<{ accessToken: string; refreshToken: string }>(
          "/v1/iam/auth/admin/refresh",
          { refreshToken },
        );
        setTokens(data.accessToken, data.refreshToken);

        const payload = decodeJwt(data.accessToken);
        if (!payload || !hasPlatformAdmin(payload)) {
          clearSession();
          throw redirect({ to: "/sign-in", search: { reason: "forbidden" } });
        }
        // Token stored and authority confirmed — allow navigation.
        return;
      } catch (err) {
        // Re-throw TanStack Router redirect throws so they are not swallowed.
        if (isRedirect(err)) throw err;

        // Any other error (network failure, 401, 403, 5xx) → unauthenticated.
        clearSession();
        throw redirect({ to: "/sign-in", search: { redirect: location.href } });
      }
    }

    // ── Path 2: token already in store — decode and check authority ──────────
    const payload = decodeJwt(token);

    if (!payload) {
      // Malformed JWT — treat as unauthenticated (Requirement 3.6).
      clearSession();
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    }

    if (!hasPlatformAdmin(payload)) {
      // Authenticated but lacks PLATFORM_ADMIN (Requirement 3.3).
      throw redirect({ to: "/unauthorized" });
    }

    // Valid token with PLATFORM_ADMIN — allow navigation (Requirement 3.4, 3.7).
  },

  component: AdminLayoutRoute,
});

// ─── Layout component ─────────────────────────────────────────────────────────

/**
 * Wraps all /admin/* routes.
 *
 * Wires the inactivity timer here so it is active for the entire admin session
 * and is automatically torn down when the admin leaves /admin/* (Requirements
 * 5.2–5.5).
 */
function AdminLayoutRoute() {
  const navigate = useNavigate();

  useInactivityTimer({
    onTimeout: () => {
      // Fire-and-forget: revoke the server-side refresh token, then clear the
      // session and redirect regardless of the API outcome (Requirements 5.2, 5.3).
      void authApi.signOut().catch(() => {
        // Ignore sign-out API errors — session is cleared regardless.
      });
      clearSession();
      void navigate({ to: "/sign-in", search: { reason: "timeout" } });
    },
  });

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
