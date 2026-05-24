import axios from "axios";
import { i18n } from "@lingui/core";
import { getConfig } from "@/app/config";

/**
 * Base Axios instance shared by all API modules.
 *
 * baseURL resolution strategy:
 *
 * DEVELOPMENT (`pnpm dev`):
 *   Uses "/api" — a relative path that hits the Vite dev proxy.
 *   The proxy (vite.config.ts) forwards /api/* to the remote origin server-side,
 *   so the browser never makes a cross-origin request and CORS is not an issue.
 *   withCredentials is set to false in dev to avoid the browser enforcing
 *   Access-Control-Allow-Credentials on the proxied response.
 *
 * PRODUCTION / CI:
 *   Uses window.VITE_API_SERVER_URL (runtime override via public/config.js) or
 *   import.meta.env.VITE_API_SERVER_URL (build-time .env).
 *   Must be the full API origin + base path, e.g. "https://api.iqkv.site/api".
 *   The server must respond with Access-Control-Allow-Credentials: true and an
 *   exact (non-wildcard) Access-Control-Allow-Origin for withCredentials to work.
 */
const isDev = import.meta.env.DEV;

/**
 * In dev we always route through the Vite proxy (/api → remote origin).
 * In production we use the configured full URL.
 */
const apiUrl = isDev ? "/api" : getConfig("VITE_API_SERVER_URL");

if (!isDev && !apiUrl) {
  throw new Error(
    "[http-client] VITE_API_SERVER_URL is not configured.\n" +
      "  Development: requests are proxied via Vite — no config needed.\n" +
      "  Production:  set window.VITE_API_SERVER_URL in public/config.js",
  );
}

export const httpClient = axios.create({
  baseURL: apiUrl,
  // withCredentials must be false when going through the Vite proxy (dev) because
  // the proxy response won't carry Access-Control-Allow-Credentials: true.
  // In production the real API server handles CORS correctly.
  withCredentials: !isDev,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

/**
 * Locale interceptor — injects the active Lingui locale as the standard
 * Accept-Language header on every outgoing request.
 *
 * The backend (AcceptHeaderLocaleResolver) reads this header to localise
 * error messages, email subjects, and validation responses. Falls back to
 * "en" when no locale is active yet (e.g. during the initial locale load).
 */
httpClient.interceptors.request.use((config) => {
  const locale = i18n.locale ?? "en-US";
  config.headers["Accept-Language"] = locale;
  return config;
});
