import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useLingui } from "@lingui/react/macro";
import { useThemeStore } from "@/processes/theme";

/**
 * Icon button that toggles between light and dark color schemes.
 *
 * - Reads the resolved scheme from Mantine (handles "auto" → actual OS value).
 * - Writes the new preference to the Zustand theme store (persisted in localStorage)
 *   and calls Mantine's `setColorScheme` so the DOM updates immediately.
 */
export function ColorSchemeToggle() {
  const { t } = useLingui();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const setStoreScheme = useThemeStore((s) => s.setColorScheme);

  const isDark = colorScheme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    setStoreScheme(next);
  };

  return (
    <Tooltip label={isDark ? t`Switch to light mode` : t`Switch to dark mode`} withArrow>
      <ActionIcon
        onClick={toggle}
        variant="subtle"
        color="gray"
        size="md"
        aria-label={isDark ? t`Switch to light mode` : t`Switch to dark mode`}
        data-testid="header-color-scheme-toggle"
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
