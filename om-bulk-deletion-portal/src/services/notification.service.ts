import { apiClient } from "@/services/api";
import type {
  AppNotification,
  NotificationListResponse,
} from "@/types/notification";

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

export async function listNotifications(): Promise<NotificationListResponse> {
  const { data } =
    await apiClient.get<ApiEnvelope<NotificationListResponse>>(
      "/notifications",
    );
  return data.data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<
    ApiEnvelope<{ unreadCount: number }>
  >("/notifications/unread-count");
  return data.data.unreadCount;
}

export async function markNotificationAsRead(
  id: number,
): Promise<{ id: number }> {
  const { data } = await apiClient.post<ApiEnvelope<{ id: number }>>(
    `/notifications/${id}/read`,
  );
  return data.data;
}

export async function markAllNotificationsAsRead(): Promise<{
  updated: number;
}> {
  const { data } = await apiClient.post<ApiEnvelope<{ updated: number }>>(
    "/notifications/read-all",
  );
  return data.data;
}

export type { AppNotification };
