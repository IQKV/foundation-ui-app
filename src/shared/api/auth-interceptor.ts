import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { httpClient } from "./http-client";
import {
  getAccessToken,
  setAccessToken,
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

  refreshPromise = httpClient
    .post<{ accessToken: string }>("/v1/iam/auth/refresh")
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
 * Skips the refresh endpoint itself to avoid an infinite loop.
 */
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.url && !config.url.includes("/auth/refresh")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * RESPONSE interceptor — on 401, attempt a silent token refresh once, then
 * replay the original request. If the refresh also fails, clear the session
 * so the router guard can redirect to the login page.
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalConfig?.url?.includes("/auth/refresh");
    const alreadyRetried = originalConfig?._retry;

    if (is401 && !isRefreshEndpoint && !alreadyRetried && originalConfig) {
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

    return Promise.reject(error);
  },
);
