import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
  TextInput,
  ActionIcon,
  Tooltip,
  Box,
  Paper,
  Skeleton,
  Alert,
  Avatar,
  Badge,
  CloseButton,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconMail,
  IconPlus,
  IconEye,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi } from "@/shared/api";
import type { Invitation, TenantMember } from "@/shared/api";
import { InvitationStatusBadge, PageHeader, TenantOwnerOnly } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { SendInvitationModal, InvitationDetailsModal } from "@/features/invite-member";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(str: string): string {
  const colors = ["blue", "cyan", "teal", "green", "violet", "grape", "pink", "orange", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ─── Members panel ────────────────────────────────────────────────────────────

interface MembersPanelProps {
  tenantKey: string;
}

function MembersPanel({ tenantKey }: MembersPanelProps) {
  const { t } = useLingui();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["members", tenantKey, debouncedSearch],
    queryFn: () =>
      iamApi.listMembers(tenantKey, {
        size: 50,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
    enabled: !!tenantKey,
  });

  const members = data?.content ?? [];

  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      <Group
        justify="space-between"
        align="center"
        px="md"
        py="sm"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
      >
        <Group gap="xs">
          <Text fw={600} size="sm">
            <Trans>Members</Trans>
          </Text>
          {!isLoading && (
            <Badge variant="light" color="gray" size="sm" radius="sm">
              {data?.totalElements ?? 0}
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          <TextInput
            placeholder={t`Search by name or email…`}
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
            style={{ width: 220 }}
            rightSection={search ? <CloseButton size="xs" onClick={() => setSearch("")} /> : null}
          />
          <Tooltip label={t`Refresh`} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => void refetch()}
              loading={isFetching}
            >
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" m="md">
          <Trans>Could not load members.</Trans>{" "}
          <Text
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
        </Alert>
      )}

      {isLoading ? (
        <Stack gap={0}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              px="md"
              py="sm"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
            >
              <Group gap="sm">
                <Skeleton circle height={36} width={36} />
                <Stack gap={4} style={{ flex: 1 }}>
                  <Skeleton height={12} width="30%" radius="sm" />
                  <Skeleton height={10} width="20%" radius="sm" />
                </Stack>
                <Skeleton height={20} width={60} radius="xl" />
              </Group>
            </Box>
          ))}
        </Stack>
      ) : members.length === 0 ? (
        <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
          {debouncedSearch ? (
            <Trans>No members match the search.</Trans>
          ) : (
            <Trans>No members found.</Trans>
          )}
        </Text>
      ) : (
        <Stack gap={0}>
          {members.map((member: TenantMember) => (
            <Box
              key={member.id}
              px="md"
              py="sm"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Avatar size={36} radius="xl" color={avatarColor(member.email)} variant="filled">
                    {initials(member.firstName, member.lastName)}
                  </Avatar>
                  <Stack gap={1}>
                    <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                      {member.firstName} {member.lastName}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                      {member.email}
                    </Text>
                  </Stack>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  {member.authorities.map((auth) => (
                    <Badge key={auth} variant="light" color="violet" size="xs" radius="sm">
                      {auth}
                    </Badge>
                  ))}
                  <Text size="xs" c="dimmed">
                    {dayjs(member.createdAt).format("MMM D, YYYY")}
                  </Text>
                </Group>
              </Group>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

// ─── Invitations panel (TENANT_OWNER only) ────────────────────────────────────

interface InvitationsPanelProps {
  tenantKey: string;
}

function InvitationsPanel({ tenantKey }: InvitationsPanelProps) {
  const { t } = useLingui();
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  const {
    data: invitations = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["invitations", tenantKey],
    queryFn: () => iamApi.listInvitations(tenantKey),
    enabled: !!tenantKey,
  });

  const handleViewDetails = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    openDetails();
  };

  const handleCloseDetails = () => {
    closeDetails();
    setTimeout(() => setSelectedInvitation(null), 300);
  };

  return (
    <>
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Group
          justify="space-between"
          align="center"
          px="md"
          py="sm"
          style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Group gap="xs">
            <Text fw={600} size="sm">
              <Trans>Pending invitations</Trans>
            </Text>
            {!isLoading && (
              <Badge variant="light" color="blue" size="sm" radius="sm">
                {invitations.length}
              </Badge>
            )}
          </Group>
          <Tooltip label={t`Refresh`} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => void refetch()}
              loading={isFetching}
            >
              <IconRefresh size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" m="md">
            <Trans>Could not load invitations.</Trans>{" "}
            <Text
              component="span"
              size="sm"
              c="red"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => void refetch()}
            >
              <Trans>Retry</Trans>
            </Text>
          </Alert>
        )}

        {isLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Skeleton circle height={32} width={32} />
                  <Skeleton height={12} width="40%" radius="sm" />
                  <Skeleton height={20} width={60} radius="xl" ml="auto" />
                </Group>
              </Box>
            ))}
          </Stack>
        ) : invitations.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>No pending invitations.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {invitations.map((inv: Invitation) => (
              <Box
                key={inv.invitationId}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--mantine-color-violet-1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconMail size={15} color="var(--mantine-color-violet-6)" />
                    </Box>
                    <Stack gap={1}>
                      <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                        {inv.email}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                        <Trans>Expires</Trans> {dayjs(inv.expiresAt).format("MMM D, YYYY")}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <InvitationStatusBadge status={inv.status} />
                    <Tooltip label={t`View details`} withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => handleViewDetails(inv)}
                      >
                        <IconEye size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <InvitationDetailsModal
        invitation={selectedInvitation}
        tenantKey={tenantKey}
        opened={detailsOpened}
        onClose={handleCloseDetails}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TeamPage() {
  const { t } = useLingui();
  const { tenantKey } = useSession();

  const [inviteOpened, { open: openInvite, close: closeInvite }] = useDisclosure(false);

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Team`)}</title>
      </Helmet>

      <PageHeader
        title={<Trans>Team</Trans>}
        breadcrumbs={[{ label: <Trans>Home</Trans>, to: "/" }, { label: <Trans>Team</Trans> }]}
        toolbar={
          <TenantOwnerOnly>
            <Button leftSection={<IconPlus size={16} />} size="sm" onClick={openInvite}>
              <Trans>Invite member</Trans>
            </Button>
          </TenantOwnerOnly>
        }
      />

      <Stack gap="md">
        {/* Members list — visible to all authenticated users */}
        {tenantKey && <MembersPanel tenantKey={tenantKey} />}

        {/* Pending invitations — visible to TENANT_OWNER only */}
        <TenantOwnerOnly>{tenantKey && <InvitationsPanel tenantKey={tenantKey} />}</TenantOwnerOnly>
      </Stack>

      {tenantKey && (
        <SendInvitationModal tenantKey={tenantKey} opened={inviteOpened} onClose={closeInvite} />
      )}
    </Container>
  );
}
