import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { httpClient } from "./http-client";
import { getAccessToken, setAccessToken, clearSession } from "@/processes/session";

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

  // Use the platform-admin-specific refresh endpoint — the regular /auth/refresh
  // requires an X-Tenant-ID header and a tenant-scoped token, neither of which
  // applies to platform admin sessions (tenant_id is null in the token).
  refreshPromise = httpClient
    .post<{ accessToken: string }>("/v1/iam/auth/admin/refresh")
    .then((res) => {
      const token = res.data.accessToken;
      setAccessToken(token);
      return token;
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
 * REQUEST interceptor — attach the in-memory access token as a Bearer header.
 * Skips auth endpoints to avoid infinite loops.
 */
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (
    token &&
    config.url &&
    !config.url.includes("/auth/refresh") &&
    !config.url.includes("/auth/admin/signin") &&
    !config.url.includes("/auth/signin")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * RESPONSE interceptor:
 * - 401: attempt a silent token refresh once, then replay the original request.
 *        If the refresh also fails, clear the session so the router guard redirects to login.
 * - 403 on an admin endpoint: the user's PLATFORM_ADMIN authority was revoked server-side.
 *        Clear the session and redirect to /sign-in?reason=forbidden.
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    const status = error.response?.status;
    const isRefreshEndpoint = originalConfig?.url?.includes("/auth/refresh");
    const alreadyRetried = originalConfig?._retry;

    if (status === 401 && !isRefreshEndpoint && !alreadyRetried && originalConfig) {
      originalConfig._retry = true;

      try {
        const newToken = await silentRefresh();
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(originalConfig);
      } catch {
        // Refresh failed — session is gone, let the caller handle the rejection.
        return Promise.reject(error);
      }
    }

    // 403 on an admin API call means the user's PLATFORM_ADMIN authority was revoked.
    // Clear the session and redirect to the sign-in page with a contextual reason.
    if (status === 403 && originalConfig?.url?.includes("/iam/admin/")) {
      clearSession();
      window.location.href = "/sign-in?reason=forbidden";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
