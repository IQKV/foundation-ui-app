import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { messages } from "../../../locales/en";

i18n.load("en", messages);
i18n.activate("en");

export type SupportedLocales = "en";

export const availableLocales = ["en"];

export const getClientLocale = () => {
  if (typeof window !== "undefined") {
    const storedLocale = document.cookie
      .split(";")
      .find((c) => c.includes("locale="))
      ?.split("=")[1];
    if (storedLocale) return getSupportedLocale(storedLocale);
    return getSupportedLocale(window.navigator.language);
  }
  return "en";
};

export async function dynamicActivateLocale(locale: string) {
  const activeLocale = availableLocales.includes(locale) ? locale : "en";
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
  return availableLocales.find((l) => l.startsWith(main)) ?? "en";
};

export const localeToFlagEmojiMap: Record<SupportedLocales, string> = {
  en: "🇬🇧",
};

export const localeToNameMap: Record<SupportedLocales, string> = {
  en: "English",
};

export const getLocaleName = (locale: SupportedLocales) => {
  // eslint-disable-next-line lingui/no-single-variables-to-translate,lingui/no-expression-in-message
  return t`${localeToNameMap[locale]}`;
};
