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
import type { MacroMessageDescriptor } from "@lingui/core/macro";
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
  label: string;
  /** Tabler icon component — callers size it themselves. */
  icon: ComponentType<{ size?: number }>;
  to: string;
}

export interface NavSection {
  /** Stable machine key — used for active-section matching and test selectors. */
  id: string;
  label: string;
  /** Route prefixes that mark this section as "active". */
  prefixes: string[];
  items: NavItem[];
}

/**
 * The `t` tagged-template function from Lingui's `useLingui()` hook.
 * Typed to match the exact overloaded signature returned by the macro.
 */
export type LinguiT = {
  (descriptor: MacroMessageDescriptor): string;
  (literals: TemplateStringsArray, ...placeholders: any[]): string;
};

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
 * Accepts translated labels (via Lingui `t`), session flags for conditional
 * items, and addon items so this module stays free of React hooks and
 * side-effects — callers own the hook calls.
 *
 * @param t           Lingui `t` tagged-template function from `useLingui()`
 * @param flags       Session-derived feature flags that gate conditional items
 * @param addonItems  Extra NavItems appended to the Workspace section
 */
export function buildNavSections(
  t: LinguiT,
  flags: NavSessionFlags,
  addonItems: NavItem[] = [],
): NavSection[] {
  const { isMultiTenantMode, isTenantOwner, isPersonalWorkspace, canManagePages } = flags;

  const workspaceItems: NavItem[] = [
    { label: t`Dashboard`, icon: IconDashboard, to: "/" },
    // Billing: hidden only when multi-tenant AND personal workspace
    ...(!isMultiTenantMode || !isPersonalWorkspace
      ? [{ label: t`Billing`, icon: IconCreditCard, to: "/billing" }]
      : []),
    // Team: visible only when multi-tenant AND tenant owner
    ...(isMultiTenantMode && isTenantOwner
      ? [{ label: t`Team`, icon: IconUsers, to: "/team" }]
      : []),
    // CMS Pages: visible only to users with TENANT_OWNER or ADMIN authority
    ...(canManagePages
      ? [{ label: t`CMS Pages`, icon: IconFileText, to: "/cms-pages" }]
      : []),
    ...addonItems,
  ];

  const accountItems: NavItem[] = [
    { label: t`General`, icon: IconUserCircle, to: "/settings/general" },
    { label: t`Security`, icon: IconLock, to: "/settings/security" },
    { label: t`Notifications`, icon: IconBell, to: "/settings/notifications" },
    ...(isMultiTenantMode
      ? [{ label: t`Organizations`, icon: IconBuilding, to: "/settings/organization" }]
      : []),
  ];

  return [
    {
      id: "workspace",
      label: t`Workspace`,
      prefixes: ["/", "/billing", "/team", "/cms-pages", "/addons"],
      items: workspaceItems,
    },
    {
      id: "account",
      label: t`Account Settings`,
      prefixes: ["/settings"],
      items: accountItems,
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the ID of the section whose prefixes match the current pathname, or undefined. */
export function getActiveSection(
  sections: NavSection[],
  pathname: string,
): string | undefined {
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
  return to
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/^$/, "dashboard");
}
