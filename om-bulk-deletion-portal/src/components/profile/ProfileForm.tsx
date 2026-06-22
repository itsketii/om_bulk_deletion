"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { FiSave } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { isNonEmpty } from "@/lib/validators";
import { updateProfile } from "@/services/auth.service";

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60";

export function ProfileForm() {
  const { user, setUser } = useAuth();
  const [fullname, setFullname] = useState(user?.fullname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFullname(user?.fullname ?? "");
    setEmail(user?.email ?? "");
  }, [user?.fullname, user?.email]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    if (!isNonEmpty(email)) {
      toast.error("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateProfile({
        fullname: fullname.trim() || null,
        email: email.trim(),
      });
      setUser(updated);
      toast.success("Profile updated");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Failed to update profile"
        : "Failed to update profile";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Username">
        <input
          value={user?.username ?? ""}
          disabled
          className={inputClass}
          readOnly
        />
        <span className="text-xs text-[var(--muted)]">
          Username cannot be changed.
        </span>
      </Field>

      <Field label="Role">
        <input
          value={user?.role ?? ""}
          disabled
          className={inputClass}
          readOnly
        />
      </Field>

      <Field label="Full name">
        <input
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          disabled={submitting}
          autoComplete="name"
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
          autoComplete="email"
          className={inputClass}
          placeholder="you@orange.com"
        />
      </Field>

      <div className="mt-2 flex items-center justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave className="h-4 w-4" />
          {submitting ? "Saving…" : "Save changes"}
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
