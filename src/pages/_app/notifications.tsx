import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Text,
  Pagination,
  Group,
  Paper,
  Divider,
  Center,
  Loader,
  Button,
} from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import {
  useNotificationList,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  NotificationItem,
} from "@/features/notification-bell";
import { z } from "zod";

const PAGE_SIZE = 20;

const notificationsSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_app/notifications")({
  validateSearch: (search) => notificationsSearchSchema.parse(search),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useLingui();
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading } = useNotificationList({
    limit: PAGE_SIZE,
    offset,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  const notifications = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    void navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <Container size="md" py={0}>
      <Helmet>
        <title>{pageTitle(t`Notifications`)}</title>
      </Helmet>

      <PageHeader
        title={<Trans>Notifications</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Notifications</Trans> },
        ]}
        rightSection={
          notifications.length > 0 && (
            <Group>
              <Button
                variant="light"
                color="gray"
                size="xs"
                onClick={() => markAllAsRead.mutate()}
                loading={markAllAsRead.isPending}
              >
                <Trans>Mark all as read</Trans>
              </Button>
              <Button
                variant="light"
                color="red"
                size="xs"
                onClick={() => deleteAll.mutate()}
                loading={deleteAll.isPending}
              >
                <Trans>Clear all</Trans>
              </Button>
            </Group>
          )
        }
      />

      <Paper withBorder radius="md" p={0}>
        {isLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : notifications.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">
              <Trans>No notifications yet</Trans>
            </Text>
          </Center>
        ) : (
          <Stack gap={0}>
            {notifications.map((n, index) => (
              <div key={n.id}>
                {index > 0 && <Divider />}
                <NotificationItem
                  notification={n}
                  onMarkAsRead={(id) => markAsRead.mutate(id)}
                  onDelete={(id) => deleteOne.mutate(id)}
                />
              </div>
            ))}
          </Stack>
        )}
      </Paper>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination total={totalPages} value={page} onChange={handlePageChange} withEdges />
        </Group>
      )}
    </Container>
  );
}
