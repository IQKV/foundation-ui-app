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
import { DataTable } from "mantine-datatable";
import {
  IconSearch,
  IconEdit,
  IconRefresh,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { iamAdminApi } from "@/shared/api";
import type { AdminUser } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { EditUserModal } from "@/features/edit-user";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

const PAGE_SIZE = 20;

/** Deterministic color from a string — keeps avatars consistent across renders. */
function avatarColor(str: string): string {
  const colors = ["blue", "cyan", "teal", "green", "violet", "grape", "pink", "orange", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "users", page, debouncedSearch],
    queryFn: () =>
      iamAdminApi.listUsers({
        page: page - 1,
        size: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
  });

  const handleEdit = (user: AdminUser) => {
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
      {/* ── Page header: title left, breadcrumb right ── */}
      <PageHeader
        title="Users"
        breadcrumbs={[{ label: "Home", to: "/admin/" }, { label: "Platform" }, { label: "Users" }]}
        toolbar={
          <Button variant="light" size="sm" leftSection={<IconDownload size={15} />} disabled>
            Export
          </Button>
        }
      />

      <Stack gap="md">
        {/* Error state */}
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Failed to load users"
            color="red"
            variant="light"
          >
            Could not fetch users from the API.{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              Retry
            </Button>
          </Alert>
        )}

        {/* ── Data card ── */}
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
                Users
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder="Search users…"
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
                size="xs"
                style={{ width: 220 }}
              />
              <Tooltip label="Refresh" withArrow>
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
              noRecordsText="No users found"
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
                  accessor: "member",
                  title: "Member",
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
                  accessor: "status",
                  title: "Status",
                  render: (user) => <UserStatusBadge status={user.status} />,
                },
                {
                  accessor: "emailVerified",
                  title: "Email",
                  render: (user) => (
                    <Badge variant="dot" color={user.emailVerified ? "green" : "orange"} size="sm">
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  ),
                },
                {
                  accessor: "createdAt",
                  title: "Joined",
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
                    <Tooltip label="Edit user" withArrow>
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

        {/* Range summary */}
        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            Showing {rangeStart}–{rangeEnd} of {totalElements} users
          </Text>
        )}
      </Stack>

      <EditUserModal user={selectedUser} opened={editModalOpened} onClose={handleCloseEdit} />
    </Container>
  );
}
