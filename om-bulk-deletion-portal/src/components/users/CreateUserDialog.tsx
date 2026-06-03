"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "@/components/ui/Modal";
import { createUser } from "@/services/users.service";
import { isNonEmpty } from "@/lib/validators";
import { MIN_PASSWORD_LENGTH, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/user";

type CreateUserDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: CreateUserDialogProps) {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setUsername("");
    setFullname("");
    setEmail("");
    setPassword("");
    setRole("USER");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !isNonEmpty(username) ||
      !isNonEmpty(fullname) ||
      !isNonEmpty(email) ||
      !isNonEmpty(password)
    ) {
      toast.error("All fields are required");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    setSubmitting(true);
    try {
      await createUser({
        username: username.trim(),
        fullname: fullname.trim(),
        email: email.trim(),
        password,
        role,
      });
      toast.success("User created");
      reset();
      onCreated();
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Failed to create user"
        : "Failed to create user";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create user"
      description="Provision a new portal account."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Username">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            autoComplete="off"
            className={inputClass}
            placeholder="jdoe"
          />
        </Field>

        <Field label="Full name">
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            disabled={submitting}
            autoComplete="off"
            className={inputClass}
            placeholder="John Doe"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            autoComplete="off"
            className={inputClass}
            placeholder="jdoe@orange.com"
          />
        </Field>

        <Field label="Temporary password">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            autoComplete="off"
            className={inputClass}
            placeholder={`Min ${MIN_PASSWORD_LENGTH} characters`}
          />
        </Field>

        <Field label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={submitting}
            className={inputClass}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

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
            {submitting ? "Creating…" : "Create user"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black">{label}</span>
      {children}
    </label>
  );
}
