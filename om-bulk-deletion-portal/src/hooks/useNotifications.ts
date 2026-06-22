"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.service";
import type { AppNotification } from "@/types/notification";

const POLL_INTERVAL_MS = 30000;

export function useNotifications(enabled: boolean = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await listNotifications();
      if (cancelledRef.current) return;
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      if (cancelledRef.current) return;
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    cancelledRef.current = false;
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    void refresh();
    const id = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [enabled, refresh]);

  const markAsRead = useCallback(async (id: number) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
