import { useMemo, useState, createElement } from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Select,
  ActionIcon,
  Avatar,
  Button,
  Alert,
  Skeleton,
  Divider,
  Badge,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconUsers, IconTrash, IconAlertCircle, IconX } from "@tabler/icons-react";
import type { VenueShareRole } from "@/shared/api";
import { TestSelectors } from "@/shared/lib/test-selectors";
import {
  useVenueShares,
  useShareCandidates,
  useShareProfiles,
  useAddVenueShare,
  useUpdateVenueShareRole,
  useRemoveVenueShare,
} from "../model";

interface VenueSharingPanelProps {
  venueId: string;
  /** Needed to populate the member picker; null in a session without a tenant key. */
  tenantKey: string | null;
  /** Owner / ADMIN grantee — server still enforces this and returns 403 otherwise. */
  canManage: boolean;
}

export function VenueSharingPanel({ venueId, tenantKey, canManage }: VenueSharingPanelProps) {
  const { t } = useLingui();

  const sharesQuery = useVenueShares(venueId);
  const candidatesQuery = useShareCandidates(canManage ? tenantKey : null);

  const shares = sharesQuery.data?.items ?? [];
  const sharedUserIds = useMemo(() => shares.map((s) => s.sharedWithUserId), [shares]);
  const profilesQuery = useShareProfiles(sharedUserIds);

  const [pendingUserId, setPendingUserId] = useState<string>("");
  const [pendingRole, setPendingRole] = useState<VenueShareRole>("EDITOR");

  const addMutation = useAddVenueShare(venueId);
  const updateMutation = useUpdateVenueShareRole(venueId);
  const removeMutation = useRemoveVenueShare(venueId);

  const roleOptions = [
    { value: "EDITOR", label: t`Editor` },
    { value: "ADMIN", label: t`Admin` },
  ];

  const nameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const profile of profilesQuery.data ?? []) {
      map.set(profile.id, `${profile.firstName} ${profile.lastName}`.trim() || profile.id);
    }
    return map;
  }, [profilesQuery.data]);

  const candidateOptions = useMemo(() => {
    const shared = new Set(sharedUserIds);
    return (candidatesQuery.data?.content ?? [])
      .filter((m) => !shared.has(m.id))
      .map((m) => ({
        value: m.id,
        label: `${`${m.firstName} ${m.lastName}`.trim() || m.email} (${m.email})`,
      }));
  }, [candidatesQuery.data, sharedUserIds]);

  function showError(title: string) {
    notifications.show({
      title,
      message: t`Please try again.`,
      color: "red",
      icon: createElement(IconX, { size: 16 }),
    });
  }

  function handleAdd() {
    if (!pendingUserId) return;
    addMutation.mutate(
      { sharedWithUserId: pendingUserId, role: pendingRole },
      {
        onSuccess: () => {
          setPendingUserId("");
          setPendingRole("EDITOR");
        },
        onError: () => showError(t`Could not share this venue`),
      },
    );
  }

  return (
    <Paper
      shadow="sm"
      radius="md"
      p="lg"
      withBorder
      data-testid={TestSelectors.VENUE_SHARING_PANEL}
    >
      <Stack gap="lg">
        <Group gap="sm" align="flex-start">
          <IconUsers size={18} color="var(--mantine-color-blue-6)" />
          <Stack gap={2}>
            <Text size="md" fw={700} lh={1.2}>
              <Trans>Sharing</Trans>
            </Text>
            <Text size="xs" c="dimmed" lh={1.45}>
              <Trans>Workspace members who can access this venue.</Trans>
            </Text>
          </Stack>
        </Group>

        {sharesQuery.isLoading ? (
          <Skeleton height={40} radius="sm" />
        ) : sharesQuery.isError ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <Trans>Could not load the sharing list.</Trans>
          </Alert>
        ) : shares.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Trans>This venue is not shared with anyone yet.</Trans>
          </Text>
        ) : (
          <Stack gap="xs">
            {shares.map((share) => (
              <Group key={share.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Avatar size="sm" radius="xl">
                    {(nameByUserId.get(share.sharedWithUserId) ?? share.sharedWithUserId)
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                  <Text size="sm" truncate>
                    {nameByUserId.get(share.sharedWithUserId) ?? share.sharedWithUserId}
                  </Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  {canManage ? (
                    <Select
                      size="xs"
                      w={120}
                      data={roleOptions}
                      value={share.role}
                      allowDeselect={false}
                      disabled={updateMutation.isPending || removeMutation.isPending}
                      data-testid={TestSelectors.VENUE_SHARE_ROLE_SELECT(share.sharedWithUserId)}
                      onChange={(role) =>
                        role &&
                        updateMutation.mutate(
                          {
                            sharedWithUserId: share.sharedWithUserId,
                            role: role as VenueShareRole,
                          },
                          { onError: () => showError(t`Could not update the role`) },
                        )
                      }
                    />
                  ) : (
                    <Badge variant="light" size="sm">
                      {share.role === "ADMIN" ? <Trans>Admin</Trans> : <Trans>Editor</Trans>}
                    </Badge>
                  )}
                  {canManage && (
                    <Tooltip label={t`Revoke access`}>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        aria-label={t`Revoke access`}
                        loading={removeMutation.isPending}
                        data-testid={TestSelectors.VENUE_SHARE_REVOKE_BUTTON(
                          share.sharedWithUserId,
                        )}
                        onClick={() =>
                          removeMutation.mutate(share.sharedWithUserId, {
                            onError: () => showError(t`Could not revoke access`),
                          })
                        }
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>
            ))}
          </Stack>
        )}

        {canManage && (
          <>
            <Divider />
            <Stack gap="sm">
              <Text size="xs" fw={600}>
                <Trans>Share with a workspace member</Trans>
              </Text>
              <Group align="flex-end" gap="sm" wrap="nowrap">
                <Select
                  style={{ flex: 1 }}
                  placeholder={t`Select a member`}
                  data={candidateOptions}
                  value={pendingUserId}
                  searchable
                  nothingFoundMessage={t`No members available`}
                  disabled={candidatesQuery.isLoading || addMutation.isPending}
                  data-testid={TestSelectors.VENUE_SHARE_MEMBER_SELECT}
                  onChange={(value) => setPendingUserId(value ?? "")}
                />
                <Select
                  w={120}
                  data={roleOptions}
                  value={pendingRole}
                  allowDeselect={false}
                  disabled={addMutation.isPending}
                  data-testid={TestSelectors.VENUE_SHARE_ADD_ROLE_SELECT}
                  onChange={(role) => role && setPendingRole(role as VenueShareRole)}
                />
                <Button
                  disabled={!pendingUserId}
                  loading={addMutation.isPending}
                  data-testid={TestSelectors.VENUE_SHARE_ADD_BUTTON}
                  onClick={handleAdd}
                >
                  <Trans>Share</Trans>
                </Button>
              </Group>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
