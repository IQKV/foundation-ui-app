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

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <IconDashboard size={16} />,
    to: "/admin/",
  },
  {
    label: "Users",
    icon: <IconUsers size={16} />,
    to: "/admin/users",
  },
  {
    label: "Organizations",
    icon: <IconBuilding size={16} />,
    to: "/admin/organizations",
    disabled: true,
  },
  {
    label: "Subscriptions",
    icon: <IconCreditCard size={16} />,
    to: "/admin/subscriptions",
    disabled: true,
  },
];

const systemItems: NavItem[] = [
  {
    label: "Audit Log",
    icon: <IconShieldCheck size={16} />,
    to: "/admin/audit",
    disabled: true,
  },
  {
    label: "Settings",
    icon: <IconSettings size={16} />,
    to: "/admin/settings",
    disabled: true,
  },
];

export function AdminNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");

  const allItems = [...navItems, ...systemItems];
  const filtered = search.trim()
    ? allItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const renderItem = (item: NavItem) => {
    const isActive =
      currentPath === item.to ||
      (item.to !== "/admin/" && item.to !== "/admin" && currentPath.startsWith(item.to));

    return (
      <NavLink
        key={item.to}
        component={item.disabled ? "button" : Link}
        {...(!item.disabled && { to: item.to })}
        label={item.label}
        leftSection={item.icon}
        active={isActive}
        disabled={item.disabled}
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-sm)",
            marginInline: "var(--mantine-spacing-xs)",
            fontSize: "var(--mantine-font-size-sm)",
          },
          label: {
            fontSize: "var(--mantine-font-size-sm)",
          },
        }}
      />
    );
  };

  return (
    <Stack gap={0} py="sm">
      {/* Search */}
      <Box px="sm" pb="sm">
        <TextInput
          placeholder="Search…"
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
            No results
          </Text>
        )
      ) : (
        <>
          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              Platform
            </Text>
          </Box>

          {navItems.map(renderItem)}

          <Divider my="sm" mx="md" />

          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              System
            </Text>
          </Box>

          {systemItems.map(renderItem)}
        </>
      )}
    </Stack>
  );
}
