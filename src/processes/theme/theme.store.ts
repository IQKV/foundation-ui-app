/**
 * Theme store — persists the user's preferred color scheme.
 *
 * - colorScheme: persisted in localStorage so the preference survives page reloads
 *   and is available synchronously on mount (avoids flash of wrong theme).
 *
 * Mantine v8 manages the actual DOM color-scheme attribute via its own
 * `localStorageColorSchemeManager`. This store is the single source of truth
 * for the React side so any component can read or toggle the scheme without
 * prop-drilling.
 */
import { create } from "zustand";
import type { MantineColorScheme } from "@mantine/core";

const STORAGE_KEY = "iqkv_color_scheme";

const loadColorScheme = (): MantineColorScheme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  } catch {
    // Ignore storage errors (private browsing, quota, etc.)
  }
  return "auto";
};

const saveColorScheme = (scheme: MantineColorScheme): void => {
  try {
    localStorage.setItem(STORAGE_KEY, scheme);
  } catch {
    // Ignore storage errors
  }
};

interface ThemeState {
  /** Current color scheme preference. "auto" follows the OS setting. */
  colorScheme: MantineColorScheme;
  /** Toggle between light and dark (skips "auto"). */
  toggleColorScheme: () => void;
  /** Explicitly set the color scheme. */
  setColorScheme: (scheme: MantineColorScheme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: loadColorScheme(),

  toggleColorScheme: () => {
    const next = get().colorScheme === "dark" ? "light" : "dark";
    saveColorScheme(next);
    set({ colorScheme: next });
  },

  setColorScheme: (scheme) => {
    saveColorScheme(scheme);
    set({ colorScheme: scheme });
  },
}));
