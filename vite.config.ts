import tanstackRouter from "@tanstack/router-plugin/vite";
import { defineConfig, loadEnv } from "vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiTarget = env.VITE_API_SERVER_URL ?? "https://api.iqkv.site/api";

  // Strip the path prefix from the target so we proxy to the origin only.
  // e.g. "https://api.iqkv.site/api" → target "https://api.iqkv.site", rewrite "/api" → ""
  const url = new URL(apiTarget);
  const proxyTarget = url.origin; // https://api.iqkv.site
  const apiBasePath = url.pathname; // /api

  return {
    define: {
      global: "window",
      "process.env": {},
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react({
        plugins: [["@lingui/swc-plugin", {}]],
      }),
      lingui(),
      !isTest && tanstackRouter(),
    ],
    server: {
      /**
       * Dev proxy — forwards /api/* to the remote API server.
       *
       * This sidesteps CORS entirely: the browser talks to localhost:5173,
       * Vite forwards the request server-side (no preflight needed).
       *
       * The proxy is only active during `pnpm dev`. In production the app
       * talks directly to VITE_API_SERVER_URL via the Axios httpClient.
       */
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          // Rewrite "/api/v1/..." → "<apiBasePath>/v1/..."
          // If apiBasePath is already "/api" this is a no-op rewrite.
          rewrite: (path) => (apiBasePath === "/api" ? path : path.replace(/^\/api/, apiBasePath)),
        },
      },
    },
  };
});
