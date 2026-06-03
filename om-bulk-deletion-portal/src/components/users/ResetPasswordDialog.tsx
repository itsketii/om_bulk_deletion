"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "@/components/ui/Modal";
import { resetUserPassword } from "@/services/users.service";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import type { User } from "@/types/user";

type ResetPasswordDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

export function ResetPasswordDialog({
  open,
  user,
  onClose,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setConfirm("");
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await resetUserPassword(user.id, password);
      toast.success(`Password reset for ${user.username}`);
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Failed to reset password"
        : "Failed to reset password";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset password"
      description={user ? `Set a new password for ${user.username}.` : undefined}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-black">New password</span>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            autoComplete="new-password"
            className={inputClass}
            placeholder={`Min ${MIN_PASSWORD_LENGTH} characters`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-black">Confirm password</span>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={submitting}
            autoComplete="new-password"
            className={inputClass}
            placeholder="Repeat the new password"
          />
        </label>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-black disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Resetting…" : "Reset password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60";
