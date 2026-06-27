import { ActionIcon, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { UserNotification } from "@/shared/api";
import { getNotificationSeverityColor } from "@/shared/lib/color-utils";

interface NotificationItemProps {
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const { id, title, message, isRead, createdAt, severity } = notification;

  const color = getNotificationSeverityColor(severity);

  return (
    <Group
      gap="sm"
      align="flex-start"
      px="sm"
      py="xs"
      style={{
        borderRadius: "var(--mantine-radius-sm)",
        background: isRead ? "transparent" : "var(--mantine-color-blue-light)",
        cursor: isRead ? "default" : "pointer",
      }}
      onClick={() => {
        if (!isRead) onMarkAsRead(id);
      }}
      data-testid={`notification-item-${id}`}
    >
      {/* Unread dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isRead ? "transparent" : `var(--mantine-color-${color}-6)`,
          flexShrink: 0,
          marginTop: 6,
        }}
      />

      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={isRead ? 400 : 600} truncate="end">
          {title}
        </Text>
        {message && (
          <Text size="xs" c="dimmed" lineClamp={2}>
            {message}
          </Text>
        )}
        <Text size="xs" c="dimmed">
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Stack>

      <Tooltip label="Delete" withArrow>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          data-testid={`notification-delete-${id}`}
        >
          <IconTrash size={14} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
