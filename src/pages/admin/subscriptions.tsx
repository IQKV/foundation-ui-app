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
  Badge,
  Select,
  CloseButton,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import {
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconDownload,
  IconFilter,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { billingApi } from "@/shared/api";
import type { Subscription, SubscriptionSortField, SortDirection } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
});

const PAGE_SIZE = 20;

/**
 * mantine-datatable uses the column `accessor` string as the sort key.
 * Map those accessor names to the backend field names the API expects.
 */
const SORT_FIELD_MAP: Record<string, SubscriptionSortField> = {
  tenantKey: "tenantKey",
  planId: "planId",
  status: "status",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past Due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
];

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "green";
    case "trialing":
      return "blue";
    case "past_due":
      return "orange";
    case "canceled":
      return "gray";
    case "unpaid":
      return "red";
    default:
      return "gray";
  }
}

function AdminSubscriptionsPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Subscription>>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "createdAt";
  const sortDir = sortStatus.direction as SortDirection;

  const hasActiveFilters = debouncedSearch !== "" || statusFilter !== null;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "subscriptions", page, debouncedSearch, statusFilter, sortBy, sortDir],
    queryFn: () =>
      billingApi.listSubscriptions({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<Subscription>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setPage(1);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{t`Subscriptions | IQKV Admin`}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Subscriptions</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Subscriptions</Trans> },
        ]}
        toolbar={
          <Button variant="light" size="sm" leftSection={<IconDownload size={15} />} disabled>
            <Trans>Export</Trans>
          </Button>
        }
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load subscriptions</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch subscriptions from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          {/* Card inner header */}
          <Group
            justify="space-between"
            align="center"
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Group gap="xs">
              <Text fw={600} size="sm">
                <Trans>Subscriptions</Trans>
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              {/* Search */}
              <TextInput
                placeholder={t`Search by tenant or plan…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => handleSearchChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 220 }}
                rightSection={
                  search ? <CloseButton size="xs" onClick={() => handleSearchChange("")} /> : null
                }
              />

              {/* Status filter */}
              <Select
                placeholder={t`All statuses`}
                leftSection={<IconFilter size={14} />}
                data={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t`${o.label}` }))}
                value={statusFilter}
                onChange={handleStatusChange}
                clearable
                size="xs"
                style={{ width: 150 }}
              />

              {/* Clear all filters */}
              {hasActiveFilters && (
                <Tooltip label={t`Clear filters`} withArrow>
                  <Button variant="subtle" color="gray" size="xs" onClick={handleClearFilters}>
                    <Trans>Clear</Trans>
                  </Button>
                </Tooltip>
              )}

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

          {/* Grid */}
          {isLoading ? (
            <Stack gap={0}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Box
                  key={i}
                  px="md"
                  py="sm"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Group gap="sm">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Skeleton height={12} width="30%" radius="sm" />
                      <Skeleton height={10} width="20%" radius="sm" />
                    </Stack>
                    <Skeleton height={20} width={60} radius="xl" />
                    <Skeleton height={20} width={80} radius="xl" />
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
              minHeight={300}
              noRecordsText={
                hasActiveFilters
                  ? t`No subscriptions match the current filters`
                  : t`No subscriptions found`
              }
              // ── Sorting ──────────────────────────────────────────────────
              sortStatus={sortStatus}
              onSortStatusChange={handleSortChange}
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
                  accessor: "tenantKey",
                  title: t`Tenant`,
                  sortable: true,
                  render: (subscription) => (
                    <Stack gap={1}>
                      <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                        {subscription.tenantKey}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                        {subscription.externalSubscriptionId}
                      </Text>
                    </Stack>
                  ),
                },
                {
                  accessor: "planId",
                  title: t`Plan`,
                  sortable: true,
                  render: (subscription) => (
                    <Text size="sm" truncate="end" maw={180}>
                      {subscription.planId}
                    </Text>
                  ),
                },
                {
                  accessor: "status",
                  title: t`Status`,
                  sortable: true,
                  render: (subscription) => (
                    <Badge
                      variant="light"
                      color={getStatusColor(subscription.status)}
                      size="sm"
                      radius="sm"
                    >
                      {subscription.status}
                    </Badge>
                  ),
                },
                {
                  accessor: "currentPeriodEnd",
                  title: t`Period End`,
                  render: (subscription) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(subscription.currentPeriodEnd).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "cancelAtPeriodEnd",
                  title: t`Auto-Renew`,
                  render: (subscription) => (
                    <Badge
                      variant="dot"
                      color={subscription.cancelAtPeriodEnd ? "orange" : "green"}
                      size="sm"
                    >
                      {subscription.cancelAtPeriodEnd ? t`Canceling` : t`Active`}
                    </Badge>
                  ),
                },
                {
                  accessor: "updatedAt",
                  title: t`Last updated`,
                  sortable: true,
                  render: (subscription) => (
                    <Text size="sm" c="dimmed">
                      {subscription.updatedAt
                        ? dayjs(subscription.updatedAt).format("MMM D, YYYY")
                        : "—"}
                    </Text>
                  ),
                },
                {
                  accessor: "createdAt",
                  title: t`Created`,
                  sortable: true,
                  render: (subscription) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(subscription.createdAt).format("MMM D, YYYY")}
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
              Showing {rangeStart}–{rangeEnd} of {totalElements} subscriptions
            </Trans>
          </Text>
        )}
      </Stack>
    </Container>
  );
}
