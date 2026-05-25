import {
  ActionIcon,
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

export function NotificationBell() {
  const [opened, { toggle, close }] = useDisclosure(false);

  // Connect WebSocket — runs once while this component is mounted
  useNotificationWs();

  const { data: unreadData } = useUnreadCount();
  const { data: listData, isLoading } = useNotificationList(20);

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  const unreadCount = unreadData?.unreadCount ?? 0;
  const notifications = listData?.items ?? [];
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
        <Tooltip label="Notifications" withArrow>
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
              data-testid="notification-bell-button"
              aria-label={`Notifications${hasUnread ? `, ${unreadCount} unread` : ""}`}
            >
              <IconBell size={18} />
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown p={0} data-testid="notification-bell-dropdown">
        {/* Header */}
        <Group px="sm" py="xs" justify="space-between">
          <Group gap="xs">
            <Text fw={600} size="sm">
              Notifications
            </Text>
            {hasUnread && (
              <Badge size="xs" color="red" variant="filled">
                {unreadCount}
              </Badge>
            )}
          </Group>
          <Group gap={4}>
            {hasUnread && (
              <Button
                variant="subtle"
                size="compact-xs"
                color="gray"
                onClick={() => markAllAsRead.mutate()}
                loading={markAllAsRead.isPending}
                data-testid="notification-mark-all-read"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="subtle"
                size="compact-xs"
                color="red"
                onClick={() => deleteAll.mutate()}
                loading={deleteAll.isPending}
                data-testid="notification-delete-all"
              >
                Clear all
              </Button>
            )}
          </Group>
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
                No notifications
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

        {/* Footer — total count hint */}
        {(listData?.totalElements ?? 0) > notifications.length && (
          <>
            <Divider />
            <Box px="sm" py="xs">
              <Text size="xs" c="dimmed" ta="center">
                Showing {notifications.length} of {listData?.totalElements} notifications
              </Text>
            </Box>
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
