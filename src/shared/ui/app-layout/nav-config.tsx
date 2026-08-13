/**
 * nav-config.ts
 *
 * Single source of truth for app navigation sections and items.
 * Consumed by both the sidebar variant (AppNav) and the top-nav variant
 * (AppTopNavBar / AppSubNavBar) so adding a route only needs one edit here.
 *
 * Navigation is split into two sections:
 *   - "workspace"       — main app items, visibility gated by session flags
 *   - "accountSettings" — personal settings sub-items
 *
 * The `id` field is a stable machine key used for active-section detection
 * and data-testid generation.
 */

import type { ComponentType } from "react";
import { Trans } from "@lingui/react/macro";
import {
  IconDashboard,
  IconUsers,
  IconCreditCard,
  IconUserCircle,
  IconLock,
  IconBell,
  IconBuilding,
  IconFileText,
} from "@tabler/icons-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: React.ReactNode;
  /** Tabler icon component — callers size it themselves. */
  icon: ComponentType<{ size?: number }>;
  to: string;
}

export interface NavSection {
  /** Stable machine key — used for active-section matching and test selectors. */
  id: string;
  label: React.ReactNode;
  /** Route prefixes that mark this section as "active". */
  prefixes: string[];
  items: NavItem[];
}

// ─── Session flags ────────────────────────────────────────────────────────────

export interface NavSessionFlags {
  isMultiTenantMode: boolean;
  isTenantOwner: boolean;
  isPersonalWorkspace: boolean;
  canManagePages: boolean;
}

// ─── Section builder ──────────────────────────────────────────────────────────

/**
 * Returns the full navigation section tree.
 *
 * Accepts session flags for conditional items, and addon items so this module
 * stays free of React hooks and side-effects — callers own the hook calls.
 *
 * @param flags       Session-derived feature flags that gate conditional items
 * @param addonItems  Extra NavItems appended to the Workspace section
 */
export function buildNavSections(flags: NavSessionFlags, addonItems: NavItem[] = []): NavSection[] {
  const { isMultiTenantMode, isTenantOwner, isPersonalWorkspace, canManagePages } = flags;

  const workspaceItems: NavItem[] = [
    { label: <Trans>Dashboard</Trans>, icon: IconDashboard, to: "/" },
    // Billing: hidden only when multi-tenant AND personal workspace
    ...(!isMultiTenantMode || !isPersonalWorkspace
      ? [{ label: <Trans>Billing</Trans>, icon: IconCreditCard, to: "/billing" }]
      : []),
    // Team: visible only when multi-tenant AND tenant owner
    ...(isMultiTenantMode && isTenantOwner
      ? [{ label: <Trans>Team</Trans>, icon: IconUsers, to: "/team" }]
      : []),
    // CMS Pages: visible only to users with TENANT_OWNER or ADMIN authority
    ...(canManagePages
      ? [{ label: <Trans>CMS Pages</Trans>, icon: IconFileText, to: "/cms-pages" }]
      : []),
    ...addonItems,
  ];

  const accountItems: NavItem[] = [
    { label: <Trans>General</Trans>, icon: IconUserCircle, to: "/settings/general" },
    { label: <Trans>Security</Trans>, icon: IconLock, to: "/settings/security" },
    { label: <Trans>Notifications</Trans>, icon: IconBell, to: "/settings/notifications" },
    ...(isMultiTenantMode
      ? [{ label: <Trans>Organizations</Trans>, icon: IconBuilding, to: "/settings/organization" }]
      : []),
  ];

  return [
    {
      id: "workspace",
      label: <Trans>Workspace</Trans>,
      prefixes: ["/", "/billing", "/team", "/cms-pages", "/addons"],
      items: workspaceItems,
    },
    {
      id: "account",
      label: <Trans>Account Settings</Trans>,
      prefixes: ["/settings"],
      items: accountItems,
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the ID of the section whose prefixes match the current pathname, or undefined. */
export function getActiveSection(sections: NavSection[], pathname: string): string | undefined {
  const section = sections.find((section) =>
    section.prefixes.some((prefix) =>
      // root "/" must be an exact match; all others are prefix matches
      prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
    ),
  );
  return section?.id;
}

/** Returns true when a nav item's route is the active one. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === "/") return pathname === "/";
  return pathname === item.to || pathname.startsWith(item.to + "/");
}

/** Derives a stable slug from a route path, e.g. "/billing" → "billing". */
export function navSlug(to: string): string {
  return to.replace(/^\//, "").replace(/\//g, "-").replace(/^$/, "dashboard");
}
