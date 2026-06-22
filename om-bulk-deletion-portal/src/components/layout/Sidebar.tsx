"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiGrid,
  FiUpload,
  FiFile,
  FiUsers,
  FiZap,
  FiLogOut,
  FiCheckSquare,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useAuth } from "@/hooks/useAuth";
import { listPendingValidationUploads } from "@/services/upload.service";
import { NotificationBell } from "@/components/layout/NotificationBell";
import type { UserRole } from "@/types/user";

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
  roles?: UserRole[];
  badgeKey?: "pendingValidation";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: FiGrid },
  { href: "/uploads", label: "Uploads", icon: FiUpload },
  {
    href: "/validation",
    label: "Validation",
    icon: FiCheckSquare,
    roles: ["SUPERADMIN", "VALIDATOR"],
    badgeKey: "pendingValidation",
  },
  {
    href: "/files",
    label: "Files",
    icon: FiFile,
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    href: "/bulk",
    label: "Bulk",
    icon: FiZap,
    roles: ["SUPERADMIN", "ADMIN"],
  },
  {
    href: "/users",
    label: "Users",
    icon: FiUsers,
    roles: ["SUPERADMIN"],
  },
];

const PENDING_POLL_INTERVAL_MS = 30000;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const canValidate =
    user?.role === "SUPERADMIN" || user?.role === "VALIDATOR";

  useEffect(() => {
    if (!canValidate) {
      setPendingCount(0);
      return;
    }
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const list = await listPendingValidationUploads();
        if (!cancelled) setPendingCount(list.length);
      } catch {
        if (!cancelled) setPendingCount(0);
      }
    };
    void fetchCount();
    const id = setInterval(() => void fetchCount(), PENDING_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [canValidate]);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black">
          <span className="h-2 w-2 rounded-sm bg-[var(--brand)]" />
        </span>
        <span className="text-sm font-semibold tracking-wide text-black">
          OM Bulk Deletion Portal
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {visibleItems.map(({ href, label, icon: Icon, badgeKey }) => {
          const active =
            pathname === href || pathname?.startsWith(`${href}/`);
          const badge =
            badgeKey === "pendingValidation" && pendingCount > 0
              ? pendingCount
              : null;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-[var(--brand-soft)] font-medium text-black"
                  : "text-[var(--muted)] hover:bg-zinc-50 hover:text-black"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active ? "text-[var(--brand)]" : "text-[var(--muted)] group-hover:text-black"
                }`}
              />
              <span className="flex-1">{label}</span>
              {badge !== null ? (
                <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--brand)] px-1.5 text-[10px] font-semibold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <Link
            href="/profile"
            aria-label="My profile"
            title="My profile"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md transition hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
              {(user?.fullname || user?.username)?.[0]?.toUpperCase() ?? "?"}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-black">
                {user?.fullname || user?.username || "—"}
              </span>
              <span className="truncate text-xs text-[var(--muted)]">
                {user?.role ?? ""}
              </span>
            </div>
          </Link>
          <NotificationBell />
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            className="rounded-md p-2 text-[var(--muted)] transition hover:bg-zinc-50 hover:text-black"
          >
            <FiLogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
