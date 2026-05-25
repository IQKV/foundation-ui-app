import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/shared/api";
import { useNotificationStore } from "./notification.store";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches the first page of notifications (most recent 20).
 * Re-fetches automatically when a WebSocket push arrives (pushSeq changes).
 */
export function useNotificationList(limit = 20) {
  const pushSeq = useNotificationStore((s) => s.pushSeq);

  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, { limit, pushSeq }],
    queryFn: () => notificationApi.list({ limit, offset: 0 }),
    staleTime: 30_000,
  });
}

/** Lightweight unread count — used for the badge. Polled every 60 s as fallback. */
export function useUnreadCount() {
  const pushSeq = useNotificationStore((s) => s.pushSeq);

  return useQuery({
    queryKey: [...UNREAD_COUNT_KEY, { pushSeq }],
    queryFn: () => notificationApi.unreadCount(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Mark a single notification as read. */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.patch(id, { isRead: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/** Mark all notifications as read. */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.patchAll({ isRead: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/** Delete a single notification. */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteOne(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/** Delete all notifications. */
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
