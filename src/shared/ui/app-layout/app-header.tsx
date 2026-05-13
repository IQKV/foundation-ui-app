import { Burger, Divider, Group, Text, Box, Avatar, Menu } from "@mantine/core";
import { IconShieldHalf, IconLogout, IconUser } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { APP_NAME } from "@/shared/lib/page-title";
import { useSignOut } from "@/features/sign-out";
import { useSessionStore } from "@/processes/session";
import { decodeJwt } from "@/shared/lib/jwt";

interface AppHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

function UserMenu() {
  const { isLoading, signOut } = useSignOut();
  const accessToken = useSessionStore((s) => s.accessToken);
  const payload = accessToken ? decodeJwt(accessToken) : null;

  const initials = payload
    ? `${payload.firstName.charAt(0)}${payload.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const displayName = payload ? `${payload.firstName} ${payload.lastName}` : "";

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Avatar size={32} radius="xl" color="blue" variant="filled" style={{ cursor: "pointer" }}>
          {initials}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        {displayName && (
          <>
            <Menu.Label>{displayName}</Menu.Label>
            <Menu.Divider />
          </>
        )}
        <Menu.Item leftSection={<IconUser size={14} />} disabled>
          <Trans>Profile</Trans>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          disabled={isLoading}
          onClick={() => void signOut()}
        >
          <Trans>Sign out</Trans>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function AppHeader({ opened, onToggle }: AppHeaderProps) {
  return (
    <Group h="100%" px={0} justify="space-between" gap={0}>
      {/* Brand block — same width as sidebar */}
      <Group
        h="100%"
        px="md"
        gap="xs"
        style={{
          width: 220,
          borderRight: "1px solid var(--mantine-color-gray-2)",
          flexShrink: 0,
        }}
      >
        <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />

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
          >
            <IconShieldHalf size={18} color="white" />
          </Box>
          <Text fw={700} size="sm" c="dark.8" style={{ letterSpacing: "-0.01em" }}>
            {APP_NAME}
          </Text>
        </Group>
      </Group>

      <Divider orientation="vertical" />

      {/* Right side — user menu */}
      <Group gap="xs" px="md" ml="auto">
        <UserMenu />
      </Group>
    </Group>
  );
}
