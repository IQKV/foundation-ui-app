import { NavLink, Stack, Text, Box, TextInput, Divider } from "@mantine/core";
import { IconDashboard, IconUsers, IconSearch, IconUserCircle } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

export function AppNav() {
  const { t } = useLingui();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");

  const navItems: NavItem[] = [
    { label: t`Dashboard`, icon: <IconDashboard size={16} />, to: "/" },
    { label: t`Team`, icon: <IconUsers size={16} />, to: "/team" },
  ];

  const accountItem: NavItem = {
    label: t`My Account`,
    icon: <IconUserCircle size={16} />,
    to: "/account",
  };

  const filtered = search.trim()
    ? navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
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
            borderRadius: "var(--mantine-radius-sm)",
            marginInline: "var(--mantine-spacing-xs)",
            fontSize: "var(--mantine-font-size-sm)",
          },
          label: { fontSize: "var(--mantine-font-size-sm)" },
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
              <Trans>Workspace</Trans>
            </Text>
          </Box>
          {navItems.map(renderItem)}

          <Divider mx="sm" my="xs" />

          <Box px="md" pb={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={1}>
              <Trans>Account</Trans>
            </Text>
          </Box>
          {renderItem(accountItem)}
        </>
      )}
    </Stack>
  );
}
