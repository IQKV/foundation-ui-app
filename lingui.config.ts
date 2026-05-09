import type { LinguiConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

const config: LinguiConfig = {
  locales: [
    "en", // English
  ],
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}",
      include: ["src"],
    },
  ],
  sourceLocale: "en",
  format: formatter({ lineNumbers: false }),
  fallbackLocales: {
    default: "en",
  },
  compileNamespace: "ts",
};

export default config;
