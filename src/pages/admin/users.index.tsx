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
  Avatar,
  Badge,
  Select,
  CloseButton,
  Anchor,
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
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { iamApi } from "@/shared/api";
import type { IamUser, IamUserSortField, IamUserStatus, SortDirection } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { EditUserModal } from "@/features/edit-user";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

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

const SORT_FIELD_MAP: Record<string, IamUserSortField> = {
  firstName: "firstName",
  email: "email",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
};

const STATUS_OPTIONS: { value: IamUserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "LOCKED", label: "Locked" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DELETED", label: "Deleted" },
];

function AdminUsersPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<IamUserStatus | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IamUser>>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IamUser | null>(null);

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "createdAt";
  const sortDir = sortStatus.direction as SortDirection;
  const hasActiveFilters = debouncedSearch !== "" || statusFilter !== null;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "users", page, debouncedSearch, statusFilter, sortBy, sortDir],
    queryFn: () =>
      iamApi.listUsers({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<IamUser>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value as IamUserStatus | null);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter(null);
    setPage(1);
  };

  const handleEdit = (user: IamUser) => {
    setSelectedUser(user);
    openEditModal();
  };

  const handleCloseEdit = () => {
    closeEditModal();
    setTimeout(() => setSelectedUser(null), 300);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{t`Users | IQKV Admin`}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Users</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Users</Trans> },
        ]}
        toolbar={undefined}
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load users</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch users from the API.</Trans>{" "}
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
                <Trans>Users</Trans>
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
                hasActiveFilters ? t`No users match the current filters` : t`No users found`
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
                  accessor: "firstName",
                  title: t`Member`,
                  sortable: true,
                  render: (user) => (
                    <Group gap="sm" wrap="nowrap">
                      <Avatar
                        size={36}
                        radius="xl"
                        color={avatarColor(user.email)}
                        variant="filled"
                      >
                        {initials(user.firstName, user.lastName)}
                      </Avatar>
                      <Stack gap={1}>
                        <Text
                          component={Link}
                          to={`/admin/users/${user.id}`}
                          size="sm"
                          fw={500}
                          style={{ lineHeight: 1.3, textDecoration: "none", color: "inherit" }}
                          styles={{
                            root: {
                              "&:hover": {
                                color: "var(--mantine-color-blue-6)",
                                textDecoration: "underline",
                              },
                            },
                          }}
                        >
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
                  accessor: "email",
                  title: t`Email`,
                  sortable: true,
                  hidden: true,
                },
                {
                  accessor: "status",
                  title: t`Status`,
                  render: (user) => <UserStatusBadge status={user.status} />,
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
                  accessor: "organizations",
                  title: t`Organization`,
                  render: (user) => {
                    if (!user.organizations || user.organizations.length === 0) {
                      return <Text size="sm" c="dimmed">—</Text>;
                    }
                    if (user.organizations.length === 1) {
                      return (
                        <Text size="sm" truncate="end" maw={180}>
                          {user.organizations[0]}
                        </Text>
                      );
                    }
                    return (
                      <Tooltip label={user.organizations.join(", ")} withArrow multiline maw={300}>
                        <Anchor size="sm" underline="hover" component="span">
                          {user.organizations[0]}{" "}
                          <Text span size="xs" c="dimmed">
                            +{user.organizations.length - 1}
                          </Text>
                        </Anchor>
                      </Tooltip>
                    );
                  },
                },
                {
                  accessor: "updatedAt",
                  title: t`Last updated`,
                  sortable: true,
                  render: (user) => (
                    <Text size="sm" c="dimmed">
                      {user.updatedAt ? dayjs(user.updatedAt).format("MMM D, YYYY") : "—"}
                    </Text>
                  ),
                },
                {
                  accessor: "createdAt",
                  title: t`Joined`,
                  sortable: true,
                  render: (user) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(user.createdAt).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  textAlign: "right",
                  render: (user) => (
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label={t`View user`} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          component={Link}
                          to={`/admin/users/${user.id}`}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <IconEye size={15} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t`Edit user`} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
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
              Showing {rangeStart}–{rangeEnd} of {totalElements} users
            </Trans>
          </Text>
        )}
      </Stack>

      <EditUserModal user={selectedUser} opened={editModalOpened} onClose={handleCloseEdit} />
    </Container>
  );
}
