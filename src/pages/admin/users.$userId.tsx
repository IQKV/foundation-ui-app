import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  ThemeIcon,
  SimpleGrid,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
  Tabs,
  Code,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconAlertCircle,
  IconMail,
  IconCalendar,
  IconRefresh,
  IconBuilding,
  IconEdit,
  IconShieldCheck,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { iamApi } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { useState } from "react";
import type { IamUser } from "@/shared/api";
import { EditUserModal } from "@/features/edit-user";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/users/$userId")({
  component: UserDetailPage,
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

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <Stack gap={4} align="center" py="md">
      {isLoading ? (
        <Skeleton height={28} width={60} radius="sm" />
      ) : (
        <Text size="xl" fw={700} lh={1}>
          {value}
        </Text>
      )}
      <Text size="xs" c="dimmed" tt="uppercase" fw={500} lts={0.5}>
        {label}
      </Text>
    </Stack>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ user, isLoading }: { user: IamUser | undefined; isLoading: boolean }) {
  return (
    <Stack gap="md" pt="md">
      {/* Stats bar */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          <StatCard
            label={<Trans>Organizations</Trans>}
            value={user?.organizations?.length ?? 0}
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Email</Trans>}
            value={
              user ? (
                <Badge
                  variant="light"
                  color={user.emailVerified ? "green" : "orange"}
                  size="sm"
                  radius="sm"
                >
                  {user.emailVerified ? <Trans>Verified</Trans> : <Trans>Unverified</Trans>}
                </Badge>
              ) : (
                "—"
              )
            }
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Joined</Trans>}
            value={user ? dayjs(user.createdAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Last updated</Trans>}
            value={user?.updatedAt ? dayjs(user.updatedAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
        </SimpleGrid>
      </Paper>

      {/* Organizations list */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <IconBuilding size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>Organizations</Trans>
          </Text>
          {!isLoading && (
            <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
              {user?.organizations?.length ?? 0}
            </Badge>
          )}
        </Group>

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
                </Group>
              </Box>
            ))}
          </Stack>
        ) : !user?.organizations || user.organizations.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>This user is not a member of any organization.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {user.organizations.map((orgName) => (
              <Box
                key={orgName}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--mantine-color-blue-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
                  </Box>
                  <Text size="sm" fw={500}>
                    {orgName}
                  </Text>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function UserDetailPage() {
  const { t } = useLingui();
  const { userId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editTarget, setEditTarget] = useState<IamUser | null>(null);

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => iamApi.getUser(userId),
  });

  const handleEdit = () => {
    if (user) {
      setEditTarget(user);
      openEdit();
    }
  };

  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setEditTarget(null), 300);
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : userId;

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>User</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Users</Trans>, to: "/admin/users" },
            { label: userId },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load user</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch user details.</Trans>{" "}
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
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{isLoading ? t`User |Key Value Admin` : t`${displayName} |Key Value Admin`}</title>
      </Helmet>

      <PageHeader
        title={isLoading ? <Skeleton height={24} width={160} radius="sm" /> : <>{displayName}</>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Users</Trans>, to: "/admin/users" },
          { label: isLoading ? userId : displayName },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Edit user`} withArrow>
              <ActionIcon
                variant="light"
                color="blue"
                size="md"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <IconEdit size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => void refetch()}
                loading={isLoading}
              >
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <Paper withBorder radius="md" p="xl" mb="md">
        <Stack align="center" gap="xs">
          {/* Avatar */}
          {isLoading ? (
            <Skeleton circle height={72} width={72} />
          ) : (
            <Avatar
              size={72}
              radius="xl"
              color={user ? avatarColor(user.email) : "gray"}
              variant="filled"
              style={{ border: "3px solid var(--mantine-color-blue-3)" }}
            >
              {user ? initials(user.firstName, user.lastName) : "?"}
            </Avatar>
          )}

          {/* Name + status */}
          <Group gap="xs" align="center">
            {isLoading ? (
              <Skeleton height={24} width={180} radius="sm" />
            ) : (
              <Text size="xl" fw={700}>
                {displayName}
              </Text>
            )}
            {!isLoading && user && <UserStatusBadge status={user.status} />}
          </Group>

          {/* Meta row */}
          <Group gap="lg" justify="center" wrap="wrap">
            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconMail size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={160} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  {user?.email}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconShieldCheck size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Badge variant="dot" color={user?.emailVerified ? "green" : "orange"} size="sm">
                  {user?.emailVerified ? (
                    <Trans>Email verified</Trans>
                  ) : (
                    <Trans>Email unverified</Trans>
                  )}
                </Badge>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconCalendar size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={100} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  <Trans>Joined</Trans> {user ? dayjs(user.createdAt).format("MMM D, YYYY") : "—"}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconBuilding size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  {user?.organizations?.length ?? 0} <Trans>organization(s)</Trans>
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        styles={{
          tab: { fontSize: "var(--mantine-font-size-sm)" },
          list: { borderBottom: "1px solid var(--mantine-color-gray-2)" },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={14} />}>
            <Trans>Overview</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            value="organizations"
            leftSection={<IconBuilding size={14} />}
            rightSection={
              !isLoading && (user?.organizations?.length ?? 0) > 0 ? (
                <Badge variant="light" color="gray" size="xs" radius="sm">
                  {user?.organizations?.length}
                </Badge>
              ) : undefined
            }
          >
            <Trans>Organizations</Trans>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab user={user} isLoading={isLoading} />
        </Tabs.Panel>

        <Tabs.Panel value="organizations">
          <Stack gap="md" pt="md">
            <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
              <Group
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
              >
                <IconBuilding size={15} color="var(--mantine-color-gray-6)" />
                <Text fw={600} size="sm">
                  <Trans>Joined Organizations</Trans>
                </Text>
                {!isLoading && (
                  <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
                    {user?.organizations?.length ?? 0}
                  </Badge>
                )}
              </Group>

              {isLoading ? (
                <Stack gap={0}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Box
                      key={i}
                      px="md"
                      py="sm"
                      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                    >
                      <Group gap="sm">
                        <Skeleton circle height={36} width={36} />
                        <Skeleton height={12} width="40%" radius="sm" />
                      </Group>
                    </Box>
                  ))}
                </Stack>
              ) : !user?.organizations || user.organizations.length === 0 ? (
                <Text size="sm" c="dimmed" px="md" py="xl" ta="center">
                  <Trans>This user is not a member of any organization.</Trans>
                </Text>
              ) : (
                <Stack gap={0}>
                  {user.organizations.map((orgName) => (
                    <Box
                      key={orgName}
                      px="md"
                      py="sm"
                      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                    >
                      <Group gap="sm" justify="space-between">
                        <Group gap="sm">
                          <Box
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "var(--mantine-color-blue-1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <IconBuilding size={18} color="var(--mantine-color-blue-6)" />
                          </Box>
                          <Text size="sm" fw={500}>
                            {orgName}
                          </Text>
                        </Group>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <EditUserModal user={editTarget} opened={editOpened} onClose={handleCloseEdit} />
    </Container>
  );
}
