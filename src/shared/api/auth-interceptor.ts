import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { httpClient } from "./http-client";
import {
  getAccessToken,
  getRefreshToken,
  getTenantKey,
  setTokens,
  clearSession,
} from "@/processes/session";

/** Extend the Axios config type to carry a retry flag. */
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Tracks an in-flight refresh so concurrent 401s share one refresh call
 * instead of each firing their own.
 */
let refreshPromise: Promise<string> | null = null;

const silentRefresh = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  const tenantKey = getTenantKey();

  if (!refreshToken || !tenantKey) {
    clearSession();
    return Promise.reject(new Error("No refresh token or tenant context available"));
  }

  // Tenant-scoped refresh — requires X-Tenant-ID header and a tenant-scoped
  // refresh token (tenant_id must match the header value server-side).
  refreshPromise = httpClient
    .post<{ accessToken: string; refreshToken: string }>(
      "/v1/iam/auth/refresh",
      { refreshToken },
      { headers: { "X-Tenant-ID": tenantKey } },
    )
    .then((res) => {
      const { accessToken, refreshToken: newRefreshToken } = res.data;
      setTokens(accessToken, newRefreshToken, tenantKey);
      return accessToken;
    })
    .catch((err: unknown) => {
      clearSession();
      refreshPromise = null;
      return Promise.reject(err);
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * REQUEST interceptor — attach the in-memory access token as a Bearer header
 * and the tenant context as X-Tenant-ID on every non-auth request.
 */
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  const tenantKey = getTenantKey();
  console.log("[auth-interceptor] request config.url:", config.url);
  console.log("[auth-interceptor] token:", !!token);
  console.log("[auth-interceptor] tenantKey:", tenantKey);

  const isAuthEndpoint =
    config.url?.includes("/auth/refresh") ||
    config.url?.includes("/auth/signin") ||
    config.url?.includes("/users/tenants") ||
    config.url?.includes("/invitations/");
  console.log("[auth-interceptor] isAuthEndpoint:", isAuthEndpoint);

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject tenant context on all non-auth requests when a tenant session is active.
  if (tenantKey && !isAuthEndpoint) {
    config.headers["X-Tenant-ID"] = tenantKey;
  }

  console.log("[auth-interceptor] final config.headers:", config.headers);
  return config;
});

/**
 * RESPONSE interceptor:
 * - 401: attempt a silent token refresh once, then replay the original request.
 *        If the refresh also fails, clear the session so the router guard redirects to sign-in.
 * - 403: the user's membership or authority was revoked server-side.
 *        Clear the session and redirect to /sign-in?reason=forbidden.
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    const status = error.response?.status;
    const requestUrl = originalConfig?.url ?? "";
    const isRefreshEndpoint = requestUrl.includes("/auth/refresh");
    const isSignInEndpoint = requestUrl.includes("/auth/signin");
    const isTenantDiscoveryEndpoint = requestUrl.includes("/users/tenants");
    const isInvitationEndpoint = requestUrl.includes("/invitations/");
    const isAuthenticationEndpoint =
      isRefreshEndpoint || isSignInEndpoint || isTenantDiscoveryEndpoint;
    const alreadyRetried = originalConfig?._retry;
    if (status === 401 && !isAuthenticationEndpoint && !alreadyRetried && originalConfig) {
      originalConfig._retry = true;

      try {
        const newToken = await silentRefresh();
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalConfig);
      } catch {
        return Promise.reject(error);
      }
    }

    // 403 Forbidden: the user's membership was revoked or they lack permission.
    // We don't clear the session here anymore to allow the UI to handle
    // permission errors gracefully (e.g. showing an "Access Denied" message
    // instead of kicking the user out entirely).
    if (status === 403 && isRefreshEndpoint) {
      clearSession();
      window.location.href = "/sign-in?reason=forbidden";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
