"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { FiKey } from "react-icons/fi";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { changePassword } from "@/services/auth.service";

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must differ from the current one");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed");
      reset();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Failed to change password"
        : "Failed to change password";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Current password">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={submitting}
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>

      <Field label="New password">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={submitting}
          autoComplete="new-password"
          className={inputClass}
          placeholder={`Min ${MIN_PASSWORD_LENGTH} characters`}
        />
      </Field>

      <Field label="Confirm new password">
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={submitting}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <div className="mt-2 flex items-center justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiKey className="h-4 w-4" />
          {submitting ? "Updating…" : "Change password"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black">{label}</span>
      {children}
    </label>
  );
}
