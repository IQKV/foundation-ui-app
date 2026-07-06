import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Indicator,
  Loader,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBell } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import {
  useNotificationList,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  useNotificationWs,
} from "../model";
import { NotificationItem } from "./notification-item";
import { TestSelectors } from "@/shared/lib/test-selectors";

export function NotificationBell() {
  const [opened, { toggle, close }] = useDisclosure(false);

  // Connect WebSocket — runs once while this component is mounted
  useNotificationWs();

  const { data: unreadData } = useUnreadCount();
  const { data: listData, isLoading } = useNotificationList({ limit: 10 });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  const unreadCount = unreadData?.unreadCount ?? 0;
  const notifications = useMemo(() => {
    return [...(listData?.items ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [listData?.items]);
  const hasUnread = unreadCount > 0;

  return (
    <Popover
      opened={opened}
      onClose={close}
      position="bottom-end"
      width={360}
      shadow="md"
      withArrow
      arrowPosition="side"
    >
      <Popover.Target>
        <Tooltip label={t`Notifications`} withArrow>
          <Indicator
            disabled={!hasUnread}
            color="red"
            size={16}
            label={unreadCount > 99 ? "99+" : String(unreadCount)}
            processing={hasUnread}
            offset={4}
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={toggle}
              data-testid={TestSelectors.NOTIFICATION_BELL_BUTTON}
              aria-label={t`Notifications${hasUnread ? `, ${unreadCount} unread` : ""}`}
            >
              <IconBell size={18} />
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown p={0} data-testid={TestSelectors.NOTIFICATION_BELL_DROPDOWN}>
        {/* Header */}
        <Group px="md" py="sm" justify="space-between">
          <Group gap="xs">
            <Text fw={600} size="sm">
              {t`Notifications`}
            </Text>
            {hasUnread && (
              <Badge size="xs" color="red" variant="filled">
                {unreadCount}
              </Badge>
            )}
          </Group>
          {hasUnread && (
            <Anchor
              component="button"
              size="xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              data-testid={TestSelectors.NOTIFICATION_MARK_ALL_READ}
            >
              {t`Mark all as read`}
            </Anchor>
          )}
        </Group>

        <Divider />

        {/* Body */}
        <ScrollArea.Autosize mah={400}>
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : notifications.length === 0 ? (
            <Stack align="center" py="xl" gap="xs">
              <IconBell size={32} color="var(--mantine-color-dimmed)" />
              <Text size="sm" c="dimmed">
                {t`No notifications yet`}
              </Text>
            </Stack>
          ) : (
            <Stack gap={0} py="xs">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={(id) => markAsRead.mutate(id)}
                  onDelete={(id) => deleteOne.mutate(id)}
                />
              ))}
            </Stack>
          )}
        </ScrollArea.Autosize>

        {/* Footer — Clear all and count hint */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Stack gap={0} p="xs">
              <Anchor
                component={Link}
                to="/settings/notifications"
                size="xs"
                ta="center"
                py="xs"
                onClick={close}
                data-testid={TestSelectors.NOTIFICATION_SEE_ALL}
              >
                {t`See all notifications`}
              </Anchor>

              <Divider variant="dashed" />

              <Group pt="xs" justify="space-between">
                <Box>
                  {(listData?.totalElements ?? 0) > notifications.length && (
                    <Text size="xs" c="dimmed">
                      {t`Showing ${notifications.length} of ${listData?.totalElements ?? 0}`}
                    </Text>
                  )}
                </Box>
                <Button
                  variant="subtle"
                  size="compact-xs"
                  color="red"
                  onClick={() => deleteAll.mutate()}
                  loading={deleteAll.isPending}
                  data-testid={TestSelectors.NOTIFICATION_DELETE_ALL}
                >
                  {t`Clear all`}
                </Button>
              </Group>
            </Stack>
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
