import { ScrollArea, Box, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { AppHeader } from "./app-header";
import { AppNav } from "./app-nav";
import { AppNavLogo } from "./app-nav-logo";
import { OnboardingModal } from "@/features/onboarding";
import { useSession } from "@/processes/session/use-session";
import classes from "./app-layout.module.css";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Two-column full-viewport layout:
 *
 *  ┌──────────┬──────────────────────────────────┐
 *  │          │  toolbar (AppHeader)             │
 *  │ sidebar  ├──────────────────────────────────┤
 *  │ (dark,   │                                  │
 *  │  full    │  page content                    │
 *  │  height) │                                  │
 *  └──────────┴──────────────────────────────────┘
 *
 * The sidebar is one continuous dark column from top to bottom.
 * The header toolbar lives only inside the right column — it never spans
 * over the sidebar.
 *
 * Mobile: sidebar slides in as a fixed overlay with a backdrop.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [onboardingOpened, { open: openOnboarding, close: closeOnboarding }] = useDisclosure();
  const { isAuthenticated, payload } = useSession();

  useEffect(() => {
    if (isAuthenticated && payload && !payload.onboarding_completed) {
      openOnboarding();
    }
  }, [isAuthenticated, payload, openOnboarding]);

  return (
    <>
      <Group align="stretch" gap={0} style={{ minHeight: "100vh" }} data-testid="app-layout">
        {/* ── Left column: full-height dark sidebar ──────────────────────── */}
        <Box
          component="nav"
          data-testid="app-nav"
          className={`${classes.sidebar} ${opened ? classes.sidebarOpen : ""}`}
          style={{
            width: 220,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            background: "var(--app-sidebar-bg)",
            boxShadow: "var(--app-sidebar-shadow)",
            minHeight: "100vh",
            position: "sticky",
            top: 0,
            zIndex: 200,
            alignSelf: "flex-start",
          }}
        >
          {/* Logo zone — pinned at the top, non-scrolling */}
          <AppNavLogo opened={opened} onToggle={toggle} />

          {/* Nav items — scrollable */}
          <ScrollArea style={{ flex: 1 }} type="scroll">
            <AppNav />
          </ScrollArea>
        </Box>

        {/* ── Right column: toolbar + page content ───────────────────────── */}
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            background: "var(--app-shell-bg)",
          }}
        >
          {/* Toolbar — sticks to the top of the right column only */}
          <Box
            component="header"
            data-testid="app-header-bar"
            style={{
              height: 52,
              flexShrink: 0,
              background: "var(--app-header-bg)",
              boxShadow: "var(--app-header-shadow)",
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            <AppHeader opened={opened} onToggle={toggle} />
          </Box>

          {/* Page content */}
          <Box component="main" p="md" style={{ flex: 1 }}>
            {children}
          </Box>
        </Box>

        {/* Mobile backdrop — tap outside to close sidebar */}
        {opened && <Box onClick={toggle} aria-hidden className={classes.backdrop} />}
      </Group>
      <OnboardingModal opened={onboardingOpened} onClose={closeOnboarding} />
    </>
  );
}
