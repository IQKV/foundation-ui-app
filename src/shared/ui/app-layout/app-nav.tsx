import { NavLink, Stack, Text, Box, TextInput, Divider, Collapse } from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconSearch,
  IconUserCircle,
  IconCreditCard,
  IconBuilding,
  IconLock,
  IconBell,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useSession } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

export function AppNav() {
  const { t } = useLingui();
  const { isTenantOwner } = useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");
  const [accountOpened, setAccountOpened] = useState(currentPath.startsWith("/settings"));

  const navItems: NavItem[] = [
    { label: t`Dashboard`, icon: <IconDashboard size={16} />, to: "/" },
    { label: t`Billing`, icon: <IconCreditCard size={16} />, to: "/billing" },
    ...(isTenantOwner ? [{ label: t`Team`, icon: <IconUsers size={16} />, to: "/team" }] : []),
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

  const renderItem = (item: NavItem, isSubItem = false) => {
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
            borderRadius: "var(--mantine-radius-sm)",
            marginInline: "var(--mantine-spacing-xs)",
            fontSize: isSubItem ? "var(--mantine-font-size-xs)" : "var(--mantine-font-size-sm)",
            paddingLeft: isSubItem ? "calc(var(--mantine-spacing-xl) * 1.5)" : undefined,
          },
          label: {
            fontSize: isSubItem ? "var(--mantine-font-size-xs)" : "var(--mantine-font-size-sm)",
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
          placeholder={t`Search…`}
          size="xs"
          leftSection={<IconSearch size={13} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          styles={{ input: { background: "var(--mantine-color-default)" } }}
        />
      </Box>

      {/* Nav items */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map((item) => renderItem(item))
        ) : (
          <Text size="xs" c="dimmed" px="md" py="xs">
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              <Trans>Workspace</Trans>
            </Text>
          </Box>
          {navItems.map((item) => renderItem(item))}

          <Divider mx="sm" my="xs" />

          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              <Trans>Account Settings</Trans>
            </Text>
          </Box>
          <NavLink
            label={t`Settings`}
            leftSection={<IconSettings size={16} />}
            opened={accountOpened}
            onClick={() => setAccountOpened((o) => !o)}
            styles={{
              root: {
                borderRadius: "var(--mantine-radius-sm)",
                marginInline: "var(--mantine-spacing-xs)",
                fontSize: "var(--mantine-font-size-sm)",
              },
              label: { fontSize: "var(--mantine-font-size-sm)" },
            }}
          >
            {accountSubItems.map((item) => renderItem(item, true))}
          </NavLink>
        </>
      )}
    </Stack>
  );
}
