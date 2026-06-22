"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useAuth } from "@/hooks/useAuth";

export function ProfileView() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-8 py-10">
      <PageHeader
        title="My profile"
        description="Update your personal information and password."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-white p-6">
          <header className="mb-4">
            <h2 className="text-sm font-semibold text-black">
              Personal information
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Your full name and email address.
            </p>
          </header>
          <ProfileForm />
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-white p-6">
          <header className="mb-4">
            <h2 className="text-sm font-semibold text-black">
              Change password
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Verify your current password to set a new one.
            </p>
          </header>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
