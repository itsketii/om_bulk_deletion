import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in · OM Bulk Deletion Portal",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-soft)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[24rem] w-[24rem] rounded-full bg-[var(--brand-soft)] blur-3xl"
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black text-white">
            <span className="h-2 w-2 rounded-sm bg-[var(--brand)]" />
          </span>
          <span className="text-sm font-medium tracking-wide text-black">
            OM Bulk Deletion Portal
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Access the MSISDN formatting portal.
        </p>

        <div className="mt-10">
          <LoginForm />
        </div>

        <p className="mt-10 text-xs text-[var(--muted)]">
          Internal use only · Orange
        </p>
      </div>
    </main>
  );
}
