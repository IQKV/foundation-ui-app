import { createFileRoute } from "@tanstack/react-router";
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
  Divider,
  Code,
  ActionIcon,
  Tooltip,
  Tabs,
  Avatar,
  Badge,
  TextInput,
  CloseButton,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import {
  IconBuilding,
  IconAlertCircle,
  IconKey,
  IconCalendar,
  IconRefresh,
  IconCreditCard,
  IconUsers,
  IconEdit,
  IconSearch,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { iamApi, billingApi } from "@/shared/api";
import { TenantStatusBadge, PageHeader } from "@/shared/ui";
import { useState } from "react";
import type { IamTenant } from "@/shared/api";
import { EditTenantModal } from "@/features/edit-tenant";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/organizations/$tenantKey")({
  component: OrganizationDetailPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

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

interface OverviewTabProps {
  tenantKey: string;
  subsLoading: boolean;
  subscriptionsPage: ReturnType<typeof billingApi.listSubscriptions> extends Promise<infer T>
    ? T | undefined
    : never;
  subscriptionCount: number;
  activeSubscriptions: number;
  memberCount: number;
  membersLoading: boolean;
  isLoading: boolean;
  tenant: IamTenant | undefined;
}

function OverviewTab({
  subsLoading,
  subscriptionsPage,
  subscriptionCount,
  activeSubscriptions,
  memberCount,
  membersLoading,
  isLoading,
  tenant,
}: OverviewTabProps) {
  return (
    <Stack gap="md" pt="md">
      {/* Stats bar */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          <StatCard label={<Trans>Members</Trans>} value={memberCount} isLoading={membersLoading} />
          <StatCard
            label={<Trans>Subscriptions</Trans>}
            value={subscriptionCount}
            isLoading={subsLoading}
          />
          <StatCard
            label={<Trans>Created</Trans>}
            value={tenant ? dayjs(tenant.createdAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Last updated</Trans>}
            value={tenant?.updatedAt ? dayjs(tenant.updatedAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
        </SimpleGrid>
      </Paper>

      {/* Subscriptions list */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <IconCreditCard size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>Subscriptions</Trans>
          </Text>
          {!subsLoading && (
            <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
              {subscriptionCount}
            </Badge>
          )}
        </Group>

        {subsLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Skeleton height={12} width="25%" radius="sm" />
                  <Skeleton height={12} width="15%" radius="sm" />
                  <Skeleton height={18} width={60} radius="xl" ml="auto" />
                </Group>
              </Box>
            ))}
          </Stack>
        ) : subscriptionsPage?.content.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>No subscriptions found for this organization.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {subscriptionsPage?.content.map((sub) => (
              <Box
                key={sub.id}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      {sub.planId}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {sub.externalSubscriptionId}
                    </Text>
                  </Stack>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      <Trans>Renews</Trans> {dayjs(sub.currentPeriodEnd).format("MMM D, YYYY")}
                    </Text>
                    <Badge
                      variant="light"
                      size="sm"
                      radius="sm"
                      color={
                        sub.status === "active"
                          ? "green"
                          : sub.status === "trialing"
                            ? "blue"
                            : sub.status === "past_due"
                              ? "orange"
                              : "gray"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </Group>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab({ tenantKey }: { tenantKey: string }) {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin", "tenants", tenantKey, "members", page, debouncedSearch],
    queryFn: () =>
      iamApi.listTenantMembers(tenantKey, {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: "createdAt",
        sortDir: "desc",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
  });

  const totalElements = data?.totalElements ?? 0;

  return (
    <Stack gap="md" pt="md">
      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          <Trans>Could not fetch members.</Trans>{" "}
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

      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        {/* Table header */}
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
                {totalElements}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            <TextInput
              placeholder={t`Search by name or email…`}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              size="xs"
              style={{ width: 220 }}
              rightSection={
                search ? (
                  <CloseButton
                    size="xs"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  />
                ) : null
              }
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

        {/* Table */}
        {isLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : (
          <DataTable
            withTableBorder={false}
            borderRadius={0}
            highlightOnHover
            records={data?.content ?? []}
            totalRecords={totalElements}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            fetching={isFetching && !isLoading}
            minHeight={200}
            noRecordsText={debouncedSearch ? t`No members match the search` : t`No members found`}
            styles={{
              header: {
                background: "var(--mantine-color-gray-0)",
                fontSize: "var(--mantine-font-size-xs)",
                fontWeight: 600,
                color: "var(--mantine-color-gray-6)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              },
            }}
            columns={[
              {
                accessor: "firstName",
                title: t`Member`,
                render: (user) => (
                  <Group gap="sm" wrap="nowrap">
                    <Avatar size={36} radius="xl" color={avatarColor(user.email)} variant="filled">
                      {initials(user.firstName, user.lastName)}
                    </Avatar>
                    <Stack gap={1}>
                      <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                        {user.email}
                      </Text>
                    </Stack>
                  </Group>
                ),
              },
              {
                accessor: "status",
                title: t`Status`,
                render: (user) => (
                  <Badge
                    variant="light"
                    size="sm"
                    color={
                      user.status === "ACTIVE"
                        ? "green"
                        : user.status === "LOCKED"
                          ? "orange"
                          : user.status === "SUSPENDED"
                            ? "red"
                            : "gray"
                    }
                  >
                    {user.status}
                  </Badge>
                ),
              },
              {
                accessor: "emailVerified",
                title: t`Email`,
                render: (user) => (
                  <Badge variant="dot" color={user.emailVerified ? "green" : "orange"} size="sm">
                    {user.emailVerified ? t`Verified` : t`Unverified`}
                  </Badge>
                ),
              },
              {
                accessor: "createdAt",
                title: t`Joined`,
                render: (user) => (
                  <Text size="sm" c="dimmed">
                    {dayjs(user.createdAt).format("MMM D, YYYY")}
                  </Text>
                ),
              },
            ]}
          />
        )}
      </Paper>

      {!isLoading && totalElements > 0 && (
        <Text size="xs" c="dimmed">
          <Trans>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalElements)}–
            {Math.min(page * PAGE_SIZE, totalElements)} of {totalElements} members
          </Trans>
        </Text>
      )}
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function OrganizationDetailPage() {
  const { t } = useLingui();
  const { tenantKey } = Route.useParams();
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editTarget, setEditTarget] = useState<IamTenant | null>(null);

  const {
    data: tenant,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "tenants", tenantKey],
    queryFn: () => iamApi.getTenant(tenantKey),
  });

  const { data: subscriptionsPage, isLoading: subsLoading } = useQuery({
    queryKey: ["admin", "subscriptions", "byTenant", tenantKey],
    queryFn: () => billingApi.listSubscriptions({ tenantKey, size: 100 }),
    enabled: !!tenant,
  });

  const { data: memberCountData, isLoading: membersLoading } = useQuery({
    queryKey: ["admin", "tenants", tenantKey, "members", "count"],
    queryFn: () => iamApi.countTenantMembers(tenantKey),
    enabled: !!tenant,
  });

  const subscriptionCount = subscriptionsPage?.totalElements ?? 0;
  const activeSubscriptions =
    subscriptionsPage?.content.filter((s) => s.status === "active").length ?? 0;
  const memberCount = memberCountData?.total ?? 0;

  const handleEdit = () => {
    if (tenant) {
      setEditTarget(tenant);
      openEdit();
    }
  };

  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setEditTarget(null), 300);
  };

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>Organization</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Organizations</Trans>, to: "/admin/organizations" },
            { label: tenantKey },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load organization</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch organization details.</Trans>{" "}
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
        <title>{isLoading ? t`Organization | IQKV Admin` : t`${tenant?.name} | IQKV Admin`}</title>
      </Helmet>

      <PageHeader
        title={isLoading ? <Skeleton height={24} width={160} radius="sm" /> : <>{tenant?.name}</>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Organizations</Trans>, to: "/admin/organizations" },
          { label: isLoading ? tenantKey : (tenant?.name ?? tenantKey) },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Edit organization`} withArrow>
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
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--mantine-color-blue-1)",
              border: "3px solid var(--mantine-color-blue-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconBuilding size={36} color="var(--mantine-color-blue-6)" />
          </Box>

          <Group gap="xs" align="center">
            {isLoading ? (
              <Skeleton height={24} width={180} radius="sm" />
            ) : (
              <Text size="xl" fw={700}>
                {tenant?.name}
              </Text>
            )}
            {!isLoading && tenant && <TenantStatusBadge status={tenant.status} />}
          </Group>

          <Group gap="lg" justify="center" wrap="wrap">
            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconKey size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Code style={{ fontSize: "var(--mantine-font-size-sm)" }}>{tenant?.tenantKey}</Code>
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
                  <Trans>Created</Trans>{" "}
                  {tenant ? dayjs(tenant.createdAt).format("MMM D, YYYY") : "—"}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconUsers size={13} />
              </ThemeIcon>
              {membersLoading ? (
                <Skeleton height={14} width={60} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  {memberCount} <Trans>member(s)</Trans>
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconCreditCard size={13} />
              </ThemeIcon>
              {subsLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  {activeSubscriptions > 0 ? (
                    <Trans>{activeSubscriptions} active subscription(s)</Trans>
                  ) : (
                    <Trans>No active subscription</Trans>
                  )}
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
          <Tabs.Tab value="overview" leftSection={<IconBuilding size={14} />}>
            <Trans>Overview</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            value="members"
            leftSection={<IconUsers size={14} />}
            rightSection={
              !membersLoading && memberCount > 0 ? (
                <Badge variant="light" color="gray" size="xs" radius="sm">
                  {memberCount}
                </Badge>
              ) : undefined
            }
          >
            <Trans>Members</Trans>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab
            tenantKey={tenantKey}
            subsLoading={subsLoading}
            subscriptionsPage={subscriptionsPage}
            subscriptionCount={subscriptionCount}
            activeSubscriptions={activeSubscriptions}
            memberCount={memberCount}
            membersLoading={membersLoading}
            isLoading={isLoading}
            tenant={tenant}
          />
        </Tabs.Panel>

        <Tabs.Panel value="members">
          <MembersTab tenantKey={tenantKey} />
        </Tabs.Panel>
      </Tabs>

      <EditTenantModal tenant={editTarget} opened={editOpened} onClose={handleCloseEdit} />
    </Container>
  );
}
