import { createTheme, type MantineThemeOverride, type CSSVariablesResolver } from "@mantine/core";

// ── Slate gray ramp (HSL 215°, low saturation) ───────────────────────────────
const slateGray: MantineThemeOverride["colors"] = {
  gray: [
    "#f8f9fb", // 0
    "#f1f3f6", // 1
    "#e4e8ef", // 2
    "#d0d6e2", // 3
    "#b0bac9", // 4
    "#8896aa", // 5
    "#5e6e84", // 6
    "#3d4f63", // 7
    "#243345", // 8
    "#111c2b", // 9
  ],
};

// ── Mantine dark color ramp for dark theme components ─────────────────────────
const darkColors: MantineThemeOverride["colors"] = {
  dark: [
    "#C1C2C5", // 0
    "#A6A7AB", // 1
    "#909296", // 2
    "#5c5f66", // 3
    "#373A40", // 4
    "#2C2E33", // 5
    "#25262b", // 6
    "#1A1B1E", // 7
    "#141517", // 8
    "#101113", // 9
  ],
};

// ── Deep indigo accent ────────────────────────────────────────────────────────
const indigoAccent: MantineThemeOverride["colors"] = {
  blue: [
    "#eef0ff", // 0
    "#dce0ff", // 1
    "#bac1fd", // 2
    "#95a0fb", // 3
    "#7280f8", // 4
    "#5465f5", // 5
    "#3b4ef0", // 6 ← primary light
    "#2c3dd4", // 7 ← primary dark
    "#1e2ea8", // 8
    "#111b7a", // 9
  ],
};

export const theme = createTheme({
  colors: {
    ...slateGray,
    ...darkColors,
    ...indigoAccent,
  },
  primaryColor: "blue",
  primaryShade: { light: 6, dark: 7 },

  fontFamily: "Inter, 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Roboto Mono', monospace",

  fontSizes: {
    xs: "0.6875rem",
    sm: "0.8125rem",
    md: "0.9375rem",
    lg: "1.0625rem",
    xl: "1.25rem",
  },

  radius: {
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
  },
  defaultRadius: "sm",

  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },

  components: {
    TextInput: { defaultProps: { size: "sm", radius: "sm" } },
    PasswordInput: { defaultProps: { size: "sm", radius: "sm" } },
    Select: { defaultProps: { size: "sm", radius: "sm" } },
    MultiSelect: { defaultProps: { size: "sm", radius: "sm" } },
    Textarea: { defaultProps: { size: "sm", radius: "sm" } },
    NumberInput: { defaultProps: { size: "sm", radius: "sm" } },
    Button: {
      defaultProps: { size: "sm", radius: "sm" },
      styles: { root: { fontWeight: 500, letterSpacing: "0.01em" } },
    },
    ActionIcon: { defaultProps: { radius: "sm" } },
    Modal: {
      defaultProps: { radius: "md", shadow: "lg" },
      styles: { header: { fontWeight: 600 } },
    },
    Menu: {
      defaultProps: { radius: "sm", shadow: "md" },
      styles: {
        dropdown: { padding: "4px" },
        item: { borderRadius: "var(--mantine-radius-xs)", fontSize: "var(--mantine-font-size-sm)" },
      },
    },
    Tooltip: {
      defaultProps: { radius: "xs" },
      styles: { tooltip: { fontSize: "var(--mantine-font-size-xs)", fontWeight: 500 } },
    },
    Badge: {
      defaultProps: { radius: "xs", size: "sm" },
      styles: {
        root: { fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" },
      },
    },
    Paper: {
      defaultProps: { radius: "md" },
      styles: {
        root: {
          boxShadow: "var(--mantine-shadow-xs)",
          backgroundColor: "var(--app-surface-bg)",
        },
      },
    },
    Card: {
      defaultProps: { radius: "md" },
      styles: {
        root: {
          boxShadow: "var(--mantine-shadow-xs)",
          backgroundColor: "var(--app-surface-bg)",
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-xs)",
          padding: "6px 10px",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: { fontWeight: 500 },
      },
    },
    Title: {
      styles: { root: { letterSpacing: "-0.02em" } },
    },
    Divider: {
      styles: { root: { borderColor: "var(--mantine-color-gray-2)" } },
    },
  },
});

/**
 * CSS variables for the app shell.
 *
 * The sidebar is always dark (independent of light/dark mode) — same
 * pattern as the admin app. The header and page canvas switch between
 * light and dark as normal.
 *
 * App sidebar uses a slightly warmer charcoal (#1e2433) vs. the admin's
 * cooler navy (#1b2332), giving each product its own personality while
 * sharing the same structural language.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    // ── Sidebar — always dark ──────────────────────────────────────────────
    "--app-sidebar-bg": "#1e2433",
    "--app-sidebar-logo-bg": "#181d2b",
    "--app-sidebar-border": "rgba(255,255,255,0.06)",
    "--app-sidebar-shadow": "1px 0 0 rgba(0,0,0,0.3)",

    // Nav item colors on dark background
    "--app-nav-text": "rgba(255,255,255,0.65)",
    "--app-nav-text-active": "#ffffff",
    "--app-nav-icon": "rgba(255,255,255,0.45)",
    "--app-nav-icon-active": "#ffffff",
    "--app-nav-hover-bg": "rgba(255,255,255,0.07)",
    "--app-nav-active-bg": "rgba(59,78,240,0.75)",

    "--app-nav-section-label": "rgba(255,255,255,0.55)",
    "--app-nav-search-bg": "rgba(255,255,255,0.08)",
    "--app-nav-search-border": "rgba(255,255,255,0.12)",
    "--app-nav-search-placeholder": "rgba(255,255,255,0.35)",
    "--app-nav-search-text": "rgba(255,255,255,0.80)",
    "--app-nav-divider": "rgba(255,255,255,0.10)",
  },
  light: {
    "--app-shell-bg": "#f4f6f9",
    "--app-header-bg": "#ffffff",
    "--app-surface-bg": "#ffffff",
    "--app-header-shadow": "0 1px 0 #e4e8ef, 0 2px 8px rgba(17,28,43,0.06)",
  },
  dark: {
    "--app-shell-bg": "#0f1621",
    "--app-header-bg": "#151d2b",
    "--app-surface-bg": "#1a2436",
    "--app-header-shadow": "0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.3)",
  },
});
