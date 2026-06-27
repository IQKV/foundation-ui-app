export interface UserNotification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string | null;
  /** Raw JSON string — use JSON.parse if you need the object. */
  payload: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface UserNotificationListResponse {
  items: UserNotification[];
  totalElements: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPatchRequest {
  isRead: boolean;
}
