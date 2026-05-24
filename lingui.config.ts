import type { LinguiConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

const config: LinguiConfig = {
  locales: [
    "en-US", // English (US)
  ],
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}",
      include: ["src"],
    },
  ],
  sourceLocale: "en-US",
  format: formatter({ lineNumbers: false }),
  fallbackLocales: {
    default: "en-US",
  },
  compileNamespace: "ts",
};

export default config;
