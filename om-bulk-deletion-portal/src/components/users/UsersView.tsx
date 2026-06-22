"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiInbox,
  FiKey,
  FiRefreshCw,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/lib/helpers";
import type { User } from "@/types/user";

export function UsersView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { users, loading, error, refresh } = useUsers();
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "SUPERADMIN") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== "SUPERADMIN") {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-10">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          title="Users"
          description="Manage portal accounts and reset credentials."
        />
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)]"
        >
          <FiUserPlus className="h-4 w-4" />
          Create user
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-black">
            <FiUsers className="h-4 w-4 text-[var(--muted)]" />
            {users.length} account{users.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-zinc-50 hover:text-black disabled:opacity-50"
          >
            <FiRefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="px-4 py-8 text-center text-sm text-red-600">
            Failed to load users
          </div>
        ) : users.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <FiInbox className="h-6 w-6 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">No users</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-2 font-medium">Username</th>
                <th className="px-4 py-2 font-medium">Full name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-black">
                    {u.username}
                    {u.id === user.id ? (
                      <span className="ml-2 text-xs text-[var(--muted)]">
                        (you)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {u.fullname || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleChip role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {u.createdAt ? formatDate(u.createdAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setResetTarget(u)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                    >
                      <FiKey className="h-3.5 w-3.5" />
                      Reset password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refresh}
      />
      <ResetPasswordDialog
        open={resetTarget !== null}
        user={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  );
}

const ROLE_CHIP_STYLES: Record<User["role"], string> = {
  SUPERADMIN: "bg-black text-white ring-black",
  ADMIN: "bg-zinc-900 text-white ring-zinc-900",
  VALIDATOR: "bg-[var(--brand-soft)] text-black ring-[var(--brand)]",
  USER: "bg-zinc-50 text-[var(--muted)] ring-[var(--border)]",
};

function RoleChip({ role }: { role: User["role"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_CHIP_STYLES[role]}`}
    >
      {role}
    </span>
  );
}
