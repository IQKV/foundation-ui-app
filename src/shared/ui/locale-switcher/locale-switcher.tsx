import { Menu, ActionIcon, Text, Group, Tooltip } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { i18n } from "@lingui/core";
import { useLingui } from "@lingui/react/macro";
import {
  availableLocales,
  dynamicActivateLocale,
  localeToFlagEmojiMap,
  localeToNameMap,
  type SupportedLocales,
} from "@/shared/locales";

/**
 * Language switcher menu.
 *
 * Renders a globe icon button that opens a dropdown listing all compiled
 * locales. When only one locale is available the button is still rendered
 * (so the UI slot is stable) but the dropdown contains a single disabled
 * item — a clear signal to users that more languages are coming.
 *
 * Switching a locale:
 * 1. Dynamically imports the compiled Lingui catalog for the chosen locale.
 * 2. Activates it on the shared `i18n` instance — all `<Trans>` / `t``
 *    calls re-render automatically via the `I18nProvider`.
 * 3. Persists the choice in a `locale` cookie so `getClientLocale()` picks
 *    it up on the next page load.
 */
export function LocaleSwitcher() {
  const { t } = useLingui();
  const activeLocale = (i18n.locale ?? "en-US") as SupportedLocales;
  const activeFlag = localeToFlagEmojiMap[activeLocale] ?? "🌐";

  const handleSelect = async (locale: SupportedLocales) => {
    if (locale === activeLocale) return;
    await dynamicActivateLocale(locale);
    // Persist in cookie so getClientLocale() restores it on reload.
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
  };

  const isSingleLocale = availableLocales.length === 1;

  return (
    <Menu shadow="md" width={160} position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label={t`Language`} withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            aria-label={t`Select language`}
            data-testid="locale-switcher"
          >
            <Text size="sm" lh={1} style={{ lineHeight: 1 }}>
              {activeFlag}
            </Text>
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t`Language`}</Menu.Label>
        {(availableLocales as SupportedLocales[]).map((locale) => {
          const isActive = locale === activeLocale;
          return (
            <Menu.Item
              key={locale}
              disabled={isSingleLocale || isActive}
              onClick={() => void handleSelect(locale)}
            >
              <Group gap="xs">
                <Text size="sm">{localeToFlagEmojiMap[locale]}</Text>
                <Text size="sm" fw={isActive ? 600 : 400}>
                  {localeToNameMap[locale]}
                </Text>
              </Group>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
