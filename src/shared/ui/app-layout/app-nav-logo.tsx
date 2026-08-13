import { Group, Text, Box, Burger } from "@mantine/core";
import { NavBrandMark } from "./nav-brand-mark";

interface AppNavLogoProps {
  opened: boolean;
  onToggle: () => void;
}

/**
 * Logo zone inside the dark sidebar.
 *
 * Sits in a non-scrolling section pinned to the top of the sidebar so the
 * entire left column reads as one unified dark element. Height matches the
 * right-column toolbar (52px) so horizontal lines stay optically aligned.
 */
export function AppNavLogo({ opened, onToggle }: AppNavLogoProps) {
  return (
    <Group
      h={52}
      px="md"
      gap="xs"
      style={{
        background: "var(--app-sidebar-logo-bg)",
        borderBottom: "1px solid var(--app-sidebar-border)",
        flexShrink: 0,
      }}
      data-testid="app-nav-logo"
    >
      {/* Mobile hamburger — only visible below sm breakpoint */}
      <Burger
        opened={opened}
        onClick={onToggle}
        hiddenFrom="sm"
        size="sm"
        color="rgba(255,255,255,0.75)"
        data-testid="sidebar-mobile-menu-toggle"
      />

      {/* Brand mark + name — visible from sm upward */}
      <Box visibleFrom="sm">
        <NavBrandMark />
      </Box>
    </Group>
  );
}
