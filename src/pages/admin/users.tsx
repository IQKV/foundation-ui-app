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
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import {
  IconSearch,
  IconEdit,
  IconRefresh,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { iamApi } from "@/shared/api";
import type { IamUser, IamUserSortField, SortDirection } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { EditUserModal } from "@/features/edit-user";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

const PAGE_SIZE = 20;

/** Deterministic avatar color from a string. */
function avatarColor(str: string): string {
  const colors = ["blue", "cyan", "teal", "green", "violet", "grape", "pink", "orange", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/**
 * mantine-datatable uses the column `accessor` string as the sort key.
 * Map those accessor names to the backend field names the API expects.
 */
const SORT_FIELD_MAP: Record<string, IamUserSortField> = {
  firstName: "firstName",
  email: "email",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
};

function AdminUsersPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IamUser>>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IamUser | null>(null);

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "createdAt";
  const sortDir = sortStatus.direction as SortDirection;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "users", page, debouncedSearch, sortBy, sortDir],
    queryFn: () =>
      iamApi.listUsers({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<IamUser>) => {
    setSortStatus(next);
    setPage(1); // reset to page 1 on sort change
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
        <title>Users | IQKV Admin</title>
      </Helmet>
      <PageHeader
        title={<Trans>Users</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Users</Trans> },
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
                placeholder={t`Search users…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
                size="xs"
                style={{ width: 220 }}
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
              noRecordsText={t`No users found`}
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
                  accessor: "email",
                  title: t`Email`,
                  sortable: true,
                  // Hidden visually — only here to enable email sort.
                  // The email is already shown in the Member column above.
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
