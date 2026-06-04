import { Box, Group, Loader, Menu, Skeleton, Text, UnstyledButton } from "@mantine/core";
import { IconBuilding, IconChevronDown, IconCheck, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";
import { useTenantSwitcher } from "../model/use-tenant-switcher";
import { isMultiTenantMode } from "@/app/config";

/**
 * Compact tenant/organisation switcher for the sidebar nav.
 *
 * Renders only in MULTI_TENANT mode and only when the user belongs to more
 * than one organisation. Shows the active org name and a chevron; clicking
 * opens a dropdown listing the other orgs plus a "New Organisation" shortcut.
 */
export function TenantSwitcher() {
  const navigate = useNavigate();
  const { activeMembership, otherMemberships, isLoading, isSwitching, switchingTo, switchTo } =
    useTenantSwitcher();

  // Only render in multi-tenant mode and when there is more than one org.
  if (!isMultiTenantMode) return null;
  if (!isLoading && otherMemberships.length === 0) return null;

  return (
    <Box px="sm" pb="xs">
      <Menu shadow="md" width="target" position="bottom-start" withinPortal>
        <Menu.Target>
          <UnstyledButton
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: "var(--mantine-radius-sm)",
              border: "1px solid var(--mantine-color-default-border)",
              background: "var(--mantine-color-default)",
            }}
            data-testid="tenant-switcher-trigger"
          >
            <Group justify="space-between" gap="xs" wrap="nowrap">
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <IconBuilding
                  size={14}
                  style={{ flexShrink: 0, color: "var(--mantine-color-blue-6)" }}
                />
                {isLoading ? (
                  <Skeleton height={12} width={100} radius="sm" />
                ) : (
                  <Text size="xs" fw={500} truncate style={{ lineHeight: 1.4 }}>
                    {activeMembership?.tenantName ?? "—"}
                  </Text>
                )}
              </Group>
              {isSwitching ? (
                <Loader size={12} />
              ) : (
                <IconChevronDown
                  size={12}
                  style={{ flexShrink: 0, color: "var(--mantine-color-dimmed)" }}
                />
              )}
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown data-testid="tenant-switcher-dropdown">
          {/* Active org — shown as non-clickable with a check */}
          {activeMembership && (
            <>
              <Menu.Label>
                <Trans>Current organization</Trans>
              </Menu.Label>
              <Menu.Item
                leftSection={<IconCheck size={13} />}
                disabled
                styles={{ item: { opacity: 1, fontWeight: 600 } }}
              >
                {activeMembership.tenantName}
              </Menu.Item>
              <Menu.Divider />
            </>
          )}

          {/* Other orgs */}
          {otherMemberships.length > 0 && (
            <>
              <Menu.Label>
                <Trans>Switch to</Trans>
              </Menu.Label>
              {otherMemberships.map((m) => (
                <Menu.Item
                  key={m.tenantKey}
                  leftSection={
                    switchingTo === m.tenantKey ? <Loader size={13} /> : <IconBuilding size={13} />
                  }
                  disabled={!!switchingTo}
                  onClick={() => void switchTo(m.tenantKey)}
                  data-testid={`tenant-switcher-option-${m.tenantKey}`}
                >
                  <Group justify="space-between" gap="xs">
                    <Text size="sm">{m.tenantName}</Text>
                    {m.authorities.length > 0 && (
                      <Text size="xs" c="dimmed">
                        {m.authorities[0]}
                      </Text>
                    )}
                  </Group>
                </Menu.Item>
              ))}
              <Menu.Divider />
            </>
          )}

          {/* New org shortcut */}
          <Menu.Item
            leftSection={<IconPlus size={13} />}
            onClick={() => void navigate({ to: "/create-organization" })}
            data-testid="tenant-switcher-new-org"
          >
            <Trans>New Organization</Trans>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
