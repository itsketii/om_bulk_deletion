"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiBell, FiCheck, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification } from "@/types/notification";

function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString();
}

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  if (type === "UPLOAD_VALIDATED") {
    return <FiCheckCircle className="h-4 w-4 text-emerald-600" />;
  }
  return <FiXCircle className="h-4 w-4 text-red-600" />;
}

export function NotificationBell() {
  const { user } = useAuth();
  const enabled = Boolean(user);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(enabled);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-md p-2 text-[var(--muted)] transition hover:bg-zinc-50 hover:text-black"
      >
        <FiBell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-80 overflow-hidden rounded-md border border-[var(--border)] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-sm font-semibold text-black">
              Notifications
            </span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="inline-flex items-center gap-1 text-xs text-[var(--muted)] transition hover:text-black"
              >
                <FiCheck className="h-3 w-3" />
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[var(--muted)]">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => {
                const href = n.uploadId ? `/uploads` : "#";
                return (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => {
                      if (!n.isRead) void markAsRead(n.id);
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 border-b border-[var(--border)] px-4 py-3 transition last:border-b-0 hover:bg-zinc-50 ${
                      n.isRead ? "bg-white" : "bg-[var(--brand-soft)]/40"
                    }`}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      <NotificationIcon type={n.type} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-black">
                        {n.title}
                      </span>
                      {n.message ? (
                        <span className="line-clamp-2 text-xs text-[var(--muted)]">
                          {n.message}
                        </span>
                      ) : null}
                      <span className="mt-1 text-[10px] text-[var(--muted)]">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    {!n.isRead ? (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--brand)]" />
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
