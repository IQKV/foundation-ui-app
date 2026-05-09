import axios from "axios";
import { getConfig } from "@/app/config";

/**
 * Base Axios instance shared by all API modules.
 *
 * baseURL resolves in priority order:
 *   1. window.VITE_API_SERVER_URL  (runtime override via public/config.js — nginx/production)
 *   2. import.meta.env.VITE_API_SERVER_URL  (build-time .env — CI/CD)
 *
 * In development the Vite proxy rewrites /api/* to the remote origin, so the
 * browser never makes a cross-origin request and CORS is not an issue.
 *
 * In production (nginx) the value must be the full API origin + base path,
 * e.g. "https://api.iqkv.site/api". Set it in public/config.js — nginx must
 * serve that file with Cache-Control: no-store so deployments take effect
 * immediately.
 *
 * withCredentials: true is required so the browser sends the httpOnly refresh
 * cookie on every request, including the silent-refresh call to /auth/refresh.
 * The API must respond with Access-Control-Allow-Credentials: true and an
 * exact (non-wildcard) Access-Control-Allow-Origin for this to work.
 */
const apiUrl = getConfig("VITE_API_SERVER_URL");

if (!apiUrl) {
  throw new Error(
    "[http-client] VITE_API_SERVER_URL is not configured.\n" +
      "  Development: set it in .env.local\n" +
      "  Production:  set window.VITE_API_SERVER_URL in public/config.js",
  );
}

export const httpClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});
