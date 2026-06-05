import { Box, Group, Loader, Menu, Skeleton, Text, UnstyledButton } from "@mantine/core";
import {
  IconBuilding,
  IconChevronDown,
  IconCheck,
  IconPlus,
  IconUser,
  IconShieldHalf,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";
import { useTenantSwitcher } from "../model/use-tenant-switcher";
import { isMultiTenantMode } from "@/app/config";
import type { UserMembership } from "@/shared/api/iam";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Consistent workspace-type icon used in both the trigger button and dropdown.
 * Priority: internal > personal > organization.
 */
function WorkspaceIcon({
  membership,
  size = 14,
}: {
  membership: Pick<UserMembership, "isInternal" | "isPersonal">;
  size?: number;
}) {
  if (membership.isInternal)
    return (
      <IconShieldHalf size={size} style={{ flexShrink: 0, color: "var(--mantine-color-red-6)" }} />
    );
  if (membership.isPersonal)
    return (
      <IconUser size={size} style={{ flexShrink: 0, color: "var(--mantine-color-green-6)" }} />
    );
  return (
    <IconBuilding size={size} style={{ flexShrink: 0, color: "var(--mantine-color-blue-6)" }} />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Compact workspace switcher for the sidebar nav.
 *
 * Renders only in MULTI_TENANT mode and only when the user belongs to more
 * than one workspace. Shows the active workspace name with a type-appropriate
 * icon (shield = internal, person = personal, building = organization).
 */
export function TenantSwitcher() {
  const navigate = useNavigate();
  const { activeMembership, otherMemberships, isLoading, isSwitching, switchingTo, switchTo } =
    useTenantSwitcher();

  // Only render in multi-tenant mode and when there is more than one workspace.
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
                {isLoading ? (
                  <Skeleton height={14} width={14} radius="sm" style={{ flexShrink: 0 }} />
                ) : (
                  activeMembership && <WorkspaceIcon membership={activeMembership} size={14} />
                )}
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
          {/* Active workspace — non-clickable, shown with checkmark */}
          {activeMembership && (
            <>
              <Menu.Label>
                <Trans>Current workspace</Trans>
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

          {/* Other workspaces */}
          {otherMemberships.length > 0 && (
            <>
              <Menu.Label>
                <Trans>Switch to</Trans>
              </Menu.Label>
              {otherMemberships.map((m) => (
                <Menu.Item
                  key={m.tenantKey}
                  leftSection={
                    switchingTo === m.tenantKey ? (
                      <Loader size={13} />
                    ) : (
                      <WorkspaceIcon membership={m} size={13} />
                    )
                  }
                  disabled={!!switchingTo}
                  onClick={() => void switchTo(m.tenantKey, m.isPersonal)}
                  data-testid={`tenant-switcher-option-${m.tenantKey}`}
                >
                  <Group justify="space-between" gap="xs">
                    <Text size="sm">{m.tenantName}</Text>
                    {!m.isPersonal && !m.isInternal && m.authorities.length > 0 && (
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

          {/* New workspace shortcut */}
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
