import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { messages } from "../../../locales/en-US";

i18n.load("en-US", messages);
i18n.activate("en-US");

export type SupportedLocales = "en-US" | "bg-BG";

export const availableLocales = ["en-US", "bg-BG"];

export const getClientLocale = () => {
  if (typeof window !== "undefined") {
    const storedLocale = document.cookie
      .split(";")
      .find((c) => c.includes("locale="))
      ?.split("=")[1];
    if (storedLocale) return getSupportedLocale(storedLocale);
    return getSupportedLocale(window.navigator.language);
  }
  return "en-US";
};

export async function dynamicActivateLocale(locale: string) {
  const activeLocale = availableLocales.includes(locale) ? locale : "en-US";
  const module = await import(`../../../locales/${activeLocale}.ts`);
  i18n.load(activeLocale, module.messages);
  i18n.activate(activeLocale);
}

export function initializeDefaultLocale() {
  // no-op — initialization happens at module level
}

export const getSupportedLocale = (userLocale: string) => {
  const normalized = userLocale.toLowerCase();
  if (availableLocales.includes(normalized)) return normalized;
  const main = normalized.split("-")[0];
  return availableLocales.find((l) => l.startsWith(main)) ?? "en-US";
};

export const localeToFlagEmojiMap: Record<SupportedLocales, string> = {
  "en-US": "🇺🇸",
  "bg-BG": "🇧🇬",
};

export const localeToNameMap: Record<SupportedLocales, string> = {
  "en-US": "English (US)",
  "bg-BG": "Български (България)",
};

export const getLocaleName = (locale: SupportedLocales) => {
  // eslint-disable-next-line lingui/no-single-variables-to-translate,lingui/no-expression-in-message
  return t`${localeToNameMap[locale]}`;
};
