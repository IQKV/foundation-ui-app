import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Box,
  Paper,
  Skeleton,
  Alert,
  Badge,
  Select,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import {
  IconRefresh,
  IconAlertCircle,
  IconFilter,
  IconPlus,
  IconTrash,
  IconDots,
  IconFileText,
  IconEdit,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";

import { PageTitle } from "@/shared/lib/page-title";
import { cmsApi } from "@/shared/api";
import type { CmsPageSummary, CmsPageStatus } from "@/shared/api";
import { PageHeader } from "@/shared/ui";
import { useSession } from "@/processes/session";
import { DeletePageModal } from "@/features/page-admin";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/cms-pages/")({
  component: CmsPagesPage,
});

const PAGE_SIZE = 20;

const STATUS_COLOR: Record<CmsPageStatus, string> = {
  DRAFT: "gray",
  PENDING: "yellow",
  PUBLISHED: "green",
  ARCHIVED: "violet",
};

function CmsPagesPage() {
  const { t } = useLingui();
  const { payload, tenantKey } = useSession();
  const authorities = payload?.authorities ?? [];
  const canManage = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CmsPageStatus | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedPage, setSelectedPage] = useState<CmsPageSummary | null>(null);

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["tenant", "cms-pages", page, statusFilter],
    queryFn: () => cmsApi.listPages({ limit: PAGE_SIZE, offset }),
    enabled: canManage,
  });

  const allItems = data?.items ?? [];
  const filteredItems = statusFilter ? allItems.filter((p) => p.status === statusFilter) : allItems;
  const totalElements = statusFilter ? filteredItems.length : (data?.totalElements ?? 0);
  const rangeStart = totalElements === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, totalElements);

  const handleDelete = (p: CmsPageSummary) => {
    setSelectedPage(p);
    openDelete();
  };

  const handleCloseDelete = () => {
    closeDelete();
    setTimeout(() => setSelectedPage(null), 300);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value as CmsPageStatus | null);
    setPage(1);
  };

  const statusOptions: { value: CmsPageStatus; label: string }[] = [
    { value: "DRAFT", label: t`Draft` },
    { value: "PENDING", label: t`Pending` },
    { value: "PUBLISHED", label: t`Published` },
    { value: "ARCHIVED", label: t`Archived` },
  ];

  if (!canManage) {
    return (
      <Container size="xl" py={0}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          <Trans>You do not have permission to manage CMS pages.</Trans>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`CMS Pages`]} />

      <PageHeader
        title={<Trans>CMS Pages</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Content</Trans> },
          { label: <Trans>Pages</Trans> },
        ]}
        toolbar={
          <Button
            leftSection={<IconPlus size={16} />}
            size="sm"
            component={Link}
            to="/cms-pages/create"
            data-testid={TestSelectors.CMS_PAGES_CREATE_NEW_PAGE_BUTTON}
          >
            <Trans>New page</Trans>
          </Button>
        }
      />

      {/* ─── Tenant context ─────────────────────────────────────────────── */}
      {tenantKey && (
        <Group gap="xs" mb="md">
          <Text size="xs" c="dimmed">
            <Trans>Workspace:</Trans>
          </Text>
          <Badge variant="outline" color="indigo" size="sm" ff="monospace" radius="sm">
            {tenantKey}
          </Badge>
        </Group>
      )}

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load pages</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch pages from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

        <Paper style={{ overflow: "hidden" }}>
          {/* ─── Table toolbar ────────────────────────────────────────── */}
          <Group
            justify="space-between"
            align="center"
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
          >
            <Group gap="xs">
              <Text fw={600} size="sm">
                <Trans>Pages</Trans>
              </Text>
              {!isLoading && (
                <Badge
                  variant="light"
                  color="gray"
                  size="sm"
                  radius="sm"
                  data-testid={TestSelectors.CMS_PAGES_TOTAL_PAGES_BADGE}
                >
                  {data?.totalElements ?? 0}
                </Badge>
              )}
              {!isLoading && totalElements > 0 && (
                <Text size="xs" c="dimmed">
                  {rangeStart}–{rangeEnd}
                </Text>
              )}
            </Group>

            <Group gap="xs">
              <Select
                placeholder={t`All statuses`}
                leftSection={<IconFilter size={14} />}
                data={statusOptions}
                value={statusFilter}
                onChange={handleStatusChange}
                clearable
                size="xs"
                style={{ width: 150 }}
                data-testid={TestSelectors.CMS_PAGES_STATUS_FILTER_SELECT}
              />
              <Tooltip label={t`Refresh`} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => void refetch()}
                  loading={isFetching}
                  data-testid={TestSelectors.CMS_PAGES_REFRESH_BUTTON}
                >
                  <IconRefresh size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {/* ─── Skeleton ─────────────────────────────────────────────── */}
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
                    <Skeleton circle height={32} width={32} />
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Skeleton height={12} width="35%" radius="sm" />
                      <Skeleton height={10} width="20%" radius="sm" />
                    </Stack>
                    <Skeleton height={20} width={70} radius="xl" />
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : (
            <DataTable
              withTableBorder={false}
              borderRadius={0}
              highlightOnHover
              records={filteredItems}
              totalRecords={totalElements}
              recordsPerPage={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              fetching={isFetching && !isLoading}
              minHeight={260}
              idAccessor="id"
              noRecordsText={
                statusFilter ? t`No pages match the current filter` : t`No pages found`
              }
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
                  accessor: "title",
                  title: t`Page`,
                  render: (p) => (
                    <Group gap="sm" wrap="nowrap">
                      <Box
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--mantine-color-indigo-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconFileText size={16} color="var(--mantine-color-indigo-6)" />
                      </Box>
                      <Stack gap={1}>
                        <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                          {p.title ?? t`(no title)`}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {p.slug}
                        </Text>
                      </Stack>
                    </Group>
                  ),
                },
                {
                  accessor: "template",
                  title: t`Template`,
                  width: 140,
                  render: (p) =>
                    p.template ? (
                      <Text size="xs" c="dimmed" ff="monospace">
                        {p.template}
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed">
                        —
                      </Text>
                    ),
                },
                {
                  accessor: "status",
                  title: t`Status`,
                  width: 110,
                  render: (p) => (
                    <Badge
                      variant="light"
                      color={STATUS_COLOR[p.status] ?? "gray"}
                      size="sm"
                      radius="sm"
                    >
                      {p.status}
                    </Badge>
                  ),
                },
                {
                  accessor: "updatedAt",
                  title: t`Updated`,
                  width: 140,
                  render: (p) => (
                    <Text size="xs" c="dimmed">
                      {dayjs(p.updatedAt).format("DD MMM YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  width: 50,
                  render: (p) => (
                    <Menu withinPortal position="bottom-end" shadow="sm" width={160}>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          data-testid={TestSelectors.CMS_PAGE_ACTIONS_MENU_TRIGGER(p.id)}
                        >
                          <IconDots size={15} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          component={Link}
                          to={`/cms-pages/${p.id}`}
                          data-testid={TestSelectors.CMS_PAGE_EDIT_BUTTON(p.id)}
                        >
                          <Trans>Edit</Trans>
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          disabled={p.status === "PUBLISHED"}
                          onClick={() => handleDelete(p)}
                          data-testid={TestSelectors.CMS_PAGE_DELETE_BUTTON(p.id)}
                        >
                          <Trans>Delete</Trans>
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  ),
                },
              ]}
            />
          )}
        </Paper>
      </Stack>

      <DeletePageModal page={selectedPage} opened={deleteOpened} onClose={handleCloseDelete} />
    </Container>
  );
}
