import { Burger, Divider, Group, Text, Box, Avatar, Menu } from "@mantine/core";
import { IconShieldHalf, IconLogout, IconUser, IconBuilding } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";
import { APP_NAME } from "@/shared/lib/page-title";
import { useSignOut } from "@/features/sign-out";
import { NotificationBell } from "@/features/notification-bell";
import { useSessionStore } from "@/processes/session";
import { decodeJwt } from "@/shared/lib/jwt";
import { isMultiTenantMode } from "@/app/config";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";

interface AppHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

function UserMenu() {
  const { isLoading, signOut } = useSignOut();
  const navigate = useNavigate();
  const accessToken = useSessionStore((s) => s.accessToken);
  const payload = accessToken ? decodeJwt(accessToken) : null;

  const initials = payload
    ? `${payload.firstName.charAt(0)}${payload.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const displayName = payload ? `${payload.firstName} ${payload.lastName}` : "";

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Avatar
          size={32}
          radius="xl"
          color="blue"
          variant="filled"
          style={{ cursor: "pointer" }}
          data-testid="header-user-menu-button"
        >
          {initials}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown data-testid="header-user-menu">
        {displayName && (
          <>
            <Menu.Label>{displayName}</Menu.Label>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          leftSection={<IconUser size={14} />}
          onClick={() => void navigate({ to: "/settings/general" })}
          data-testid="button--profile"
        >
          <Trans>My Account</Trans>
        </Menu.Item>
        {isMultiTenantMode && (
          <Menu.Item
            leftSection={<IconBuilding size={14} />}
            onClick={() => void navigate({ to: "/settings/organization" })}
            data-testid="button--organizations"
          >
            <Trans>Organizations</Trans>
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          disabled={isLoading}
          onClick={() => void signOut()}
          data-testid="button--sign-out"
        >
          <Trans>Sign out</Trans>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function AppHeader({ opened, onToggle }: AppHeaderProps) {
  return (
    <Group h="100%" px={0} justify="space-between" gap={0} data-testid="app-header">
      {/* Brand block — same width as sidebar */}
      <Group
        h="100%"
        px="md"
        gap="xs"
        style={{
          width: 220,
          borderRight: "1px solid var(--mantine-color-default-border)",
          flexShrink: 0,
        }}
      >
        <Burger
          opened={opened}
          onClick={onToggle}
          hiddenFrom="sm"
          size="sm"
          data-testid="header-mobile-menu-toggle"
        />

        <Group gap={8} visibleFrom="sm" style={{ cursor: "default" }}>
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--mantine-radius-md)",
              background: "var(--mantine-color-dark-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            data-testid="header-logo"
          >
            <IconShieldHalf size={18} color="white" />
          </Box>
          <Text
            fw={700}
            size="sm"
            c="var(--mantine-color-text)"
            style={{ letterSpacing: "-0.01em" }}
          >
            {APP_NAME}
          </Text>
        </Group>
      </Group>

      <Divider orientation="vertical" />

      {/* Right side — user menu */}
      <Group gap="xs" px="md" ml="auto">
        <LocaleSwitcher />
        <ColorSchemeToggle />
        <NotificationBell />
        <UserMenu />
      </Group>
    </Group>
  );
}
