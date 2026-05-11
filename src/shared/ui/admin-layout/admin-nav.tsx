import { NavLink, Stack, Text, Box, Divider, TextInput } from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconSettings,
  IconShieldCheck,
  IconSearch,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  disabled?: boolean;
}

export function AdminNav() {
  const { t } = useLingui();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");

  const navItems: NavItem[] = [
    { label: t`Dashboard`, icon: <IconDashboard size={16} />, to: "/admin/" },
    { label: t`Users`, icon: <IconUsers size={16} />, to: "/admin/users" },
    {
      label: t`Organizations`,
      icon: <IconBuilding size={16} />,
      to: "/admin/organizations",
    },
    {
      label: t`Subscriptions`,
      icon: <IconCreditCard size={16} />,
      to: "/admin/subscriptions",
      disabled: true,
    },
  ];

  const systemItems: NavItem[] = [
    {
      label: t`Audit Log`,
      icon: <IconShieldCheck size={16} />,
      to: "/admin/audit",
      disabled: true,
    },
    { label: t`Settings`, icon: <IconSettings size={16} />, to: "/admin/settings", disabled: true },
  ];

  const allItems = [...navItems, ...systemItems];
  const filtered = search.trim()
    ? allItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const renderItem = (item: NavItem) => {
    const isActive =
      currentPath === item.to ||
      (item.to !== "/admin/" && item.to !== "/admin" && currentPath.startsWith(item.to));

    const sharedProps = {
      label: item.label,
      leftSection: item.icon,
      active: isActive,
      disabled: item.disabled,
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-sm)",
          marginInline: "var(--mantine-spacing-xs)",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: {
          fontSize: "var(--mantine-font-size-sm)",
        },
      },
    };

    if (item.disabled) {
      return <NavLink key={item.to} {...sharedProps} component="button" />;
    }

    return <NavLink key={item.to} {...sharedProps} component={Link} to={item.to} />;
  };

  return (
    <Stack gap={0} py="sm">
      {/* Search */}
      <Box px="sm" pb="sm">
        <TextInput
          placeholder={t`Search…`}
          size="xs"
          leftSection={<IconSearch size={13} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          styles={{
            input: {
              background: "var(--mantine-color-white)",
            },
          }}
        />
      </Box>

      {/* Filtered results */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map(renderItem)
        ) : (
          <Text size="xs" c="dimmed" px="md" py="xs">
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              <Trans>Platform</Trans>
            </Text>
          </Box>

          {navItems.map(renderItem)}

          <Divider my="sm" mx="md" />

          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              <Trans>System</Trans>
            </Text>
          </Box>

          {systemItems.map(renderItem)}
        </>
      )}
    </Stack>
  );
}
