"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { isNonEmpty } from "@/lib/validators";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      toast.error("Username and password are required");
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success("Welcome back");
      router.replace("/dashboard");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Sign in failed"
        : "Sign in failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-xs font-medium text-black">
          Username
        </label>
        <div className="relative">
          <FiUser
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            className="w-full rounded-md border border-[var(--border)] bg-white py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60"
            placeholder="your.username"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-xs font-medium text-black">
          Password
        </label>
        <div className="relative">
          <FiLock
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            className="w-full rounded-md border border-[var(--border)] bg-white py-2.5 pl-10 pr-10 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--muted)] transition hover:text-black"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
