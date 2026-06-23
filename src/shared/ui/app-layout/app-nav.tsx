import { NavLink, Stack, Text, Box, TextInput, Divider } from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconSearch,
  IconUserCircle,
  IconCreditCard,
  IconBuilding,
  IconLock,
  IconBell,
  IconFileText,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useSession } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";
import { TenantSwitcher } from "@/features/tenant-switcher";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

/** Uppercase section label styled for the dark sidebar */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="xs"
      fw={600}
      tt="uppercase"
      lts="0.06em"
      px={14}
      pt={12}
      pb={4}
      style={{
        color: "var(--app-nav-section-label)",
        userSelect: "none",
        fontSize: "0.625rem",
      }}
    >
      {children}
    </Text>
  );
}

export function AppNav() {
  const { t } = useLingui();
  const { isTenantOwner, isPersonalWorkspace, payload } = useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");
  const authorities = payload?.authorities ?? [];
  const canManagePages = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");

  const navItems: NavItem[] = [
    { label: t`Dashboard`, icon: <IconDashboard size={16} />, to: "/" },
    ...(!isMultiTenantMode || !isPersonalWorkspace
      ? [{ label: t`Billing`, icon: <IconCreditCard size={16} />, to: "/billing" }]
      : []),
    ...(isTenantOwner ? [{ label: t`Team`, icon: <IconUsers size={16} />, to: "/team" }] : []),
    ...(canManagePages
      ? [{ label: t`CMS Pages`, icon: <IconFileText size={16} />, to: "/cms-pages" }]
      : []),
  ];

  const accountSubItems: NavItem[] = [
    { label: t`General`, icon: <IconUserCircle size={14} />, to: "/settings/general" },
    { label: t`Security`, icon: <IconLock size={14} />, to: "/settings/security" },
    { label: t`Notifications`, icon: <IconBell size={14} />, to: "/settings/notifications" },
    ...(isMultiTenantMode
      ? [
          {
            label: t`Organizations`,
            icon: <IconBuilding size={14} />,
            to: "/settings/organization",
          },
        ]
      : []),
  ];

  const filtered = search.trim()
    ? [...navItems, ...accountSubItems].filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  const renderItem = (item: NavItem) => {
    const isActive =
      item.to === "/"
        ? currentPath === "/"
        : currentPath === item.to || currentPath.startsWith(item.to + "/");

    return (
      <NavLink
        key={item.to}
        label={item.label}
        leftSection={item.icon}
        active={isActive}
        component={Link}
        to={item.to}
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-xs)",
            marginInline: "8px",
            paddingBlock: "7px",
            paddingInline: "10px",
            background: isActive ? "var(--app-nav-active-bg)" : "transparent",
            "&:hover": {
              background: isActive ? "var(--app-nav-active-bg)" : "var(--app-nav-hover-bg)",
            },
          },
          label: {
            fontSize: "var(--mantine-font-size-sm)",
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "var(--app-nav-text-active)" : "var(--app-nav-text)",
          },
          section: {
            width: 20,
            marginRight: 8,
            color: isActive ? "var(--app-nav-icon-active)" : "var(--app-nav-icon)",
          },
        }}
      />
    );
  };

  return (
    <Stack gap={0} py={6}>
      {/* Search */}
      <Box px={10} pb={6}>
        <TextInput
          placeholder={t`Search…`}
          size="xs"
          leftSection={<IconSearch size={13} color="var(--app-nav-search-placeholder)" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          styles={{
            input: {
              background: "var(--app-nav-search-bg)",
              border: "1px solid var(--app-nav-search-border)",
              color: "var(--app-nav-search-text)",
              "&::placeholder": { color: "var(--app-nav-search-placeholder)" },
            },
          }}
        />
      </Box>

      {/* Tenant switcher — only when not searching and multi-tenant mode active */}
      {!search.trim() && <TenantSwitcher />}

      {/* Results / full nav */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map((item) => renderItem(item))
        ) : (
          <Text size="xs" px="md" py="xs" style={{ color: "var(--app-nav-section-label)" }}>
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          <SectionLabel>
            <Trans>Workspace</Trans>
          </SectionLabel>
          {navItems.map((item) => renderItem(item))}

          <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />

          <SectionLabel>
            <Trans>Account Settings</Trans>
          </SectionLabel>
          {accountSubItems.map((item) => renderItem(item))}
        </>
      )}
    </Stack>
  );
}
