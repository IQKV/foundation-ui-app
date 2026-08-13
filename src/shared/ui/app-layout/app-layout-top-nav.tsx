/**
 * app-layout-top-nav.tsx
 *
 * Top-nav variant layout: two-level horizontal navigation (52px L1 + 44px L2).
 * Single-column shell with no sidebar.
 *
 * Structure:
 *   - AppTopNavBar (L1: logo, section tabs, utility strip)
 *   - AppSubNavBar (L2: items for active section, auto-hides if ≤1 items)
 *   - Main content area (full width, scrollable)
 */

import { AppShell } from "@mantine/core";
import { AppTopNavBar } from "./app-top-nav-bar";
import { AppSubNavBar } from "./app-sub-nav-bar";

interface AppLayoutTopNavProps {
  children: React.ReactNode;
}

export function AppLayoutTopNav({ children }: AppLayoutTopNavProps) {
  return (
    <AppShell
      header={{ height: 52 }}
      styles={{
        main: {
          paddingTop: "calc(var(--app-shell-header-height, 0px) + 0px)",
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 0,
        },
      }}
    >
      <AppShell.Header>
        <AppTopNavBar />
      </AppShell.Header>

      <AppShell.Main>
        <AppSubNavBar />
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
