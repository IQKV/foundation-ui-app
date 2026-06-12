import { Group, Text, Box, Burger } from "@mantine/core";
import { IconShieldHalf } from "@tabler/icons-react";
import { APP_NAME } from "@/shared/lib/page-title";

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
      <Group gap={10} visibleFrom="sm" style={{ cursor: "default" }} wrap="nowrap">
        <Box
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--mantine-radius-sm)",
            background: "var(--mantine-color-blue-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(59,78,240,0.45)",
          }}
          data-testid="sidebar-logo-mark"
        >
          <IconShieldHalf size={16} color="white" strokeWidth={1.8} />
        </Box>

        <Box style={{ lineHeight: 1 }}>
          <Text
            size="sm"
            fw={700}
            style={{ color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            {APP_NAME}
          </Text>
          <Text
            size="xs"
            style={{
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.60rem",
              lineHeight: 1.4,
            }}
          >
            Workspace
          </Text>
        </Box>
      </Group>
    </Group>
  );
}
