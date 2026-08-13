/**
 * app-sub-nav-bar.tsx
 *
 * Level-2 horizontal bar (44px) for top-nav variant.
 *
 * Shows nav items for the active section only. Hides itself when the active
 * section has 0 or 1 items (no sub-navigation needed).
 *
 * Sticky positioning: sticks below the L1 bar (top: 52px) on scroll.
 */

import { Group, Box } from "@mantine/core";
import { useRouterState } from "@tanstack/react-router";
import { useLingui } from "@lingui/react/macro";
import { useSession } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";
import { navigationExtension } from "@/app/addons";
import { buildNavSections, getActiveSection } from "./nav-config";
import { NavItemRenderer } from "./nav-item-renderer";

export function AppSubNavBar() {
  const { t } = useLingui();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isTenantOwner, isPersonalWorkspace, payload } = useSession();
  const authorities = payload?.authorities ?? [];
  const canManagePages = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");

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
  const activeSection = sections.find((s) => s.id === activeSectionId);

  // Hide bar if no active section or ≤1 items (no sub-navigation needed)
  if (!activeSection || activeSection.items.length <= 1) {
    return null;
  }

  return (
    <Box
      style={{
        height: 44,
        position: "sticky",
        top: 52,
        zIndex: 100,
        background: "var(--app-subnav-bg)",
        borderBottom: "1px solid var(--app-subnav-border)",
      }}
      data-testid="app-sub-nav-bar"
    >
      <Group gap={4} px="md" h="100%" wrap="nowrap" style={{ overflowX: "auto" }}>
        {activeSection.items.map((item) => (
          <Box key={item.to} style={{ flexShrink: 0 }}>
            <NavItemRenderer item={item} currentPath={currentPath} iconSize={14} />
          </Box>
        ))}
      </Group>
    </Box>
  );
}
