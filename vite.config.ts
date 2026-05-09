import tanstackRouter from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";

const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    lingui(),
    !isTest && tanstackRouter(),
  ],
});
