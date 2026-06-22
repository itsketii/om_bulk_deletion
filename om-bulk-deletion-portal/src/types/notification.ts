export type NotificationType = "UPLOAD_VALIDATED" | "UPLOAD_REJECTED";

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string | null;
  uploadId: number | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};
