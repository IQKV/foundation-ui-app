import { defineConfig, coverageConfigDefaults } from "vitest/config";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [lingui(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    exclude: ["./node_modules/**", "**/storybook/**", "./dist/**", "./e2e/**", "./*.???"],
    include: ["./src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "./*.??",
        "./src/**/*.d.ts",
        "./**/*.config.{ts,js}",
        "./**/*.js",
        "./**/*.stories.js",
        "./src/**/*.gen.ts",
        "./src/**/index.ts",
        "./src/locales/**",
        "./src/pages/**",
        "./node_modules/**",
        "./e2e/**",
        "**/.storybook/**",
      ],
      provider: "v8",
      reporter: ["text", "html", "lcov"],
    },
  },
});
