import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  Code,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import {
  IconSearch,
  IconEdit,
  IconEye,
  IconRefresh,
  IconAlertCircle,
  IconFilter,
  IconBuilding,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { iamApi } from "@/shared/api";
import type { IamTenant, IamTenantSortField, IamTenantStatus, SortDirection } from "@/shared/api";
import { TenantStatusBadge, PageHeader } from "@/shared/ui";
import { EditTenantModal } from "@/features/edit-tenant";

export const Route = createFileRoute("/admin/organizations/")({
  component: AdminOrganizationsPage,
});

const PAGE_SIZE = 20;

const SORT_FIELD_MAP: Record<string, IamTenantSortField> = {
  name: "name",
  tenantKey: "tenantKey",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
};

const STATUS_OPTIONS: { value: IamTenantStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DELETED", label: "Deleted" },
];

function AdminOrganizationsPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<IamTenantStatus | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IamTenant>>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedTenant, setSelectedTenant] = useState<IamTenant | null>(null);

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "createdAt";
  const sortDir = sortStatus.direction as SortDirection;

  const hasActiveFilters = debouncedSearch !== "" || statusFilter !== null;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "tenants", page, debouncedSearch, statusFilter, sortBy, sortDir],
    queryFn: () =>
      iamApi.listTenants({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<IamTenant>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value as IamTenantStatus | null);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setPage(1);
  };

  const handleEdit = (tenant: IamTenant) => {
    setSelectedTenant(tenant);
    openEditModal();
  };

  const handleCloseEdit = () => {
    closeEditModal();
    setTimeout(() => setSelectedTenant(null), 300);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{t`Organizations |Key Value Admin`}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Organizations</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Organizations</Trans> },
        ]}
        toolbar={undefined}
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load organizations</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch organizations from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

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
                <Trans>Organizations</Trans>
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder={t`Search by name or key…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => handleSearchChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 220 }}
                rightSection={
                  search ? <CloseButton size="xs" onClick={() => handleSearchChange("")} /> : null
                }
              />

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
              minHeight={300}
              noRecordsText={
                hasActiveFilters
                  ? t`No organizations match the current filters`
                  : t`No organizations found`
              }
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
                  accessor: "name",
                  title: t`Organization`,
                  sortable: true,
                  render: (tenant) => (
                    <Group gap="sm" wrap="nowrap">
                      <Box
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "var(--mantine-color-blue-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconBuilding size={18} color="var(--mantine-color-blue-6)" />
                      </Box>
                      <Stack gap={1}>
                        <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                          {tenant.name}
                        </Text>
                        <Code
                          style={{
                            fontSize: "var(--mantine-font-size-xs)",
                            lineHeight: 1.3,
                            padding: "0 4px",
                          }}
                        >
                          {tenant.tenantKey}
                        </Code>
                      </Stack>
                    </Group>
                  ),
                },
                {
                  accessor: "tenantKey",
                  title: t`Key`,
                  sortable: true,
                  hidden: true,
                },
                {
                  accessor: "status",
                  title: t`Status`,
                  render: (tenant) => <TenantStatusBadge status={tenant.status} />,
                },
                {
                  accessor: "updatedAt",
                  title: t`Last updated`,
                  sortable: true,
                  render: (tenant) => (
                    <Text size="sm" c="dimmed">
                      {tenant.updatedAt ? dayjs(tenant.updatedAt).format("MMM D, YYYY") : "—"}
                    </Text>
                  ),
                },
                {
                  accessor: "createdAt",
                  title: t`Created`,
                  sortable: true,
                  render: (tenant) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(tenant.createdAt).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  textAlign: "right",
                  render: (tenant) => (
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label={t`View organization`} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          component={Link}
                          to="/admin/organizations/$tenantKey"
                          params={{ tenantKey: tenant.tenantKey } as never}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <IconEye size={15} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t`Edit organization`} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(tenant);
                          }}
                        >
                          <IconEdit size={15} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  ),
                },
              ]}
            />
          )}
        </Paper>

        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart}–{rangeEnd} of {totalElements} organizations
            </Trans>
          </Text>
        )}
      </Stack>

      <EditTenantModal tenant={selectedTenant} opened={editModalOpened} onClose={handleCloseEdit} />
    </Container>
  );
}
