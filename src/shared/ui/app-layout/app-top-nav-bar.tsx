/**
 * app-top-nav-bar.tsx
 *
 * Level-1 horizontal bar (52px) for top-nav variant.
 *
 * Shows:
 *  - Logo/brand mark (left)
 *  - Section tabs (center) — click navigates to first item in that section
 *  - Utility strip (right) — tenant switcher, New Org button, locale, theme, notifications, user menu
 *  - Mobile drawer with full nav
 */

import { Group, Button, Box, Drawer, UnstyledButton, Burger } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Trans, useLingui } from "@lingui/react/macro";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";
import { NotificationBell } from "@/features/notification-bell";
import { TenantSwitcher } from "@/features/tenant-switcher";
import { useSession } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";
import { navigationExtension } from "@/app/addons";
import { AppHeaderUserMenu } from "./app-header";
import { NavBrandMark } from "./nav-brand-mark";
import { buildNavSections, getActiveSection } from "./nav-config";
import { NavItemRenderer } from "./nav-item-renderer";
import { useState } from "react";

interface SectionTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SectionTab({ label, isActive, onClick }: SectionTabProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        height: "100%",
        paddingInline: 20,
        display: "flex",
        alignItems: "center",
        fontSize: "var(--mantine-font-size-sm)",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "var(--mantine-color-white)" : "rgba(255,255,255,0.75)",
        borderBottom: isActive ? "2px solid var(--mantine-color-blue-4)" : "2px solid transparent",
        transition: "all 120ms ease",
        cursor: "pointer",
        "&:hover": {
          color: "var(--mantine-color-white)",
          background: "rgba(255,255,255,0.06)",
        },
      }}
      data-testid={`section-tab-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {label}
    </UnstyledButton>
  );
}

export function AppTopNavBar() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isTenantOwner, isPersonalWorkspace, payload } = useSession();
  const authorities = payload?.authorities ?? [];
  const canManagePages = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");
  const [drawerOpened, setDrawerOpened] = useState(false);

  const addonItems = navigationExtension.getNavItems("workspace");

  const sections = buildNavSections(
    t,
    {
      isMultiTenantMode,
      isTenantOwner,
      isPersonalWorkspace,
      canManagePages,
    },
    addonItems,
  );

  const activeSectionId = getActiveSection(sections, currentPath);

  const handleSectionClick = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.items.length > 0) {
      void navigate({ to: section.items[0].to });
    }
  };

  return (
    <>
      <Box
        style={{
          height: 52,
          background: "var(--app-topbar-bg)",
          borderBottom: "1px solid var(--app-topbar-border)",
          display: "flex",
          alignItems: "center",
          paddingInline: "var(--mantine-spacing-md)",
        }}
        data-testid="app-top-nav-bar"
      >
        {/* Mobile burger */}
        <Burger
          opened={drawerOpened}
          onClick={() => setDrawerOpened((o) => !o)}
          hiddenFrom="sm"
          size="sm"
          color="rgba(255,255,255,0.75)"
          data-testid="topbar-mobile-menu-toggle"
        />

        {/* Brand mark — always visible on desktop */}
        <Box visibleFrom="sm" style={{ marginRight: 24 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <NavBrandMark />
          </Link>
        </Box>

        {/* Section tabs — desktop only */}
        <Group gap={0} visibleFrom="sm" style={{ height: "100%" }}>
          {sections.map((section) => (
            <SectionTab
              key={section.id}
              label={section.label}
              isActive={activeSectionId === section.id}
              onClick={() => handleSectionClick(section.id)}
            />
          ))}
        </Group>

        {/* Right utility strip */}
        <Group gap="xs" ml="auto">
          {isMultiTenantMode && <TenantSwitcher />}
          {isMultiTenantMode && (
            <Button
              variant="filled"
              size="sm"
              leftSection={<IconPlus size={14} />}
              onClick={() => void navigate({ to: "/create-organization" })}
            >
              <Trans>New Organization</Trans>
            </Button>
          )}
          <LocaleSwitcher />
          <ColorSchemeToggle />
          <NotificationBell />
          <AppHeaderUserMenu />
        </Group>
      </Box>

      {/* Mobile drawer with full nav */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        size="280px"
        title={<NavBrandMark />}
        styles={{
          header: {
            background: "var(--app-sidebar-bg)",
            borderBottom: "1px solid var(--app-sidebar-border)",
          },
          body: {
            background: "var(--app-sidebar-bg)",
            padding: 0,
          },
        }}
      >
        <Box py="sm">
          {sections.map((section, idx) => (
            <Box key={section.id}>
              {idx > 0 && (
                <Box
                  mx={10}
                  my={6}
                  style={{ height: 1, background: "var(--app-nav-divider)" }}
                />
              )}
              <Box
                px={14}
                pt={12}
                pb={4}
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--app-nav-section-label)",
                  userSelect: "none",
                }}
              >
                {section.label}
              </Box>
              {section.items.map((item) => (
                <NavItemRenderer
                  key={item.to}
                  item={item}
                  currentPath={currentPath}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Drawer>
    </>
  );
}
