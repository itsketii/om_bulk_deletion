"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { BulkExecutionsList } from "@/components/bulk/BulkExecutionsList";
import { LogViewerDialog } from "@/components/bulk/LogViewerDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBulkExecutions } from "@/hooks/useBulkExecutions";
import type { BulkExecution } from "@/types/bulk";

const POLL_INTERVAL_MS = 15000;

export function BulkView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { executions, loading, error, refresh } = useBulkExecutions({
    pollIntervalMs: POLL_INTERVAL_MS,
  });
  const [logTarget, setLogTarget] = useState<BulkExecution | null>(null);

  const canAccess = user?.role === "SUPERADMIN" || user?.role === "ADMIN";

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canAccess) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, canAccess, router]);

  if (authLoading || !user || !canAccess) {
    return null;
  }

  const running = executions.filter((e) => e.status === "RUNNING").length;
  const completed = executions.filter((e) => e.status === "COMPLETED").length;
  const failed = executions.filter((e) => e.status === "FAILED").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-10">
      <PageHeader
        title="Bulk processing"
        description="Trigger and monitor CDF / USD bulk deletion runs."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Running" value={running} accent="amber" />
        <SummaryCard label="Completed" value={completed} accent="emerald" />
        <SummaryCard label="Failed" value={failed} accent="red" />
      </div>

      <BulkExecutionsList
        executions={executions}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onOpenLog={(e) => setLogTarget(e)}
      />

      <LogViewerDialog
        open={logTarget !== null}
        execution={logTarget}
        onClose={() => setLogTarget(null)}
      />
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  accent: "amber" | "emerald" | "red";
};

const ACCENT_CLASSES: Record<SummaryCardProps["accent"], string> = {
  amber: "text-amber-700",
  emerald: "text-emerald-700",
  red: "text-red-700",
};

function SummaryCard({ label, value, accent }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {label}
      </span>
      <div className={`mt-1 text-2xl font-semibold ${ACCENT_CLASSES[accent]}`}>
        {value}
      </div>
    </div>
  );
}
