import { Group, Burger, Avatar, Menu, Text } from "@mantine/core";
import { IconLogout, IconUser, IconBuilding, IconPlus } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";
import { useSignOut } from "@/features/sign-out";
import { NotificationBell } from "@/features/notification-bell";
import { useSessionStore } from "@/processes/session";
import { decodeJwt } from "@/shared/lib/jwt";
import { isMultiTenantMode } from "@/app/config";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";
import { useQuery } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";
import { Button } from "@mantine/core";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface AppHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

function UserMenu() {
  const { isLoading, signOut } = useSignOut();
  const navigate = useNavigate();
  const accessToken = useSessionStore((s) => s.accessToken);
  const payload = accessToken ? decodeJwt(accessToken) : null;

  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: () => iamApi.getMe(),
    enabled: !!accessToken,
  });

  const initials = payload
    ? `${payload.firstName.charAt(0)}${payload.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const displayName = payload ? `${payload.firstName} ${payload.lastName}` : "";

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Avatar
          src={profile?.avatarUrl}
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
          data-testid={TestSelectors.HEADER_USER_MENU_PROFILE_BUTTON}
        >
          <Trans>My Account</Trans>
        </Menu.Item>
        {isMultiTenantMode && (
          <Menu.Item
            leftSection={<IconBuilding size={14} />}
            onClick={() => void navigate({ to: "/settings/organization" })}
            data-testid={TestSelectors.HEADER_USER_MENU_ORGANIZATIONS_BUTTON}
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

/**
 * Top toolbar — right column only.
 *
 * The brand/logo has moved into AppNavLogo (inside the dark sidebar) so the
 * sidebar reads as one unified column. This header owns only the right-side
 * utility controls and, on mobile, the hamburger toggle.
 */
export function AppHeader({ opened, onToggle }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <Group h="100%" px="md" justify="space-between" gap={0} data-testid="app-header">
      {/* Mobile-only hamburger */}
      <Burger
        opened={opened}
        onClick={onToggle}
        hiddenFrom="sm"
        size="sm"
        data-testid="header-mobile-menu-toggle"
        aria-label="Toggle navigation"
      />

      {/* Right-side utility strip */}
      <Group gap="xs" ml="auto">
        {isMultiTenantMode && (
          <Button
            variant="filled"
            size="sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => void navigate({ to: "/create-organization" })}
          >
            <Trans>New Organization</Trans>
          </Button>
        )}
        <LocaleSwitcher />
        <ColorSchemeToggle />
        <NotificationBell />
        <UserMenu />
      </Group>
    </Group>
  );
}
