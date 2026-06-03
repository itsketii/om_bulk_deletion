"use client";

import { FiFileText, FiInbox, FiRefreshCw, FiZap } from "react-icons/fi";
import { BulkStatusBadge } from "@/components/bulk/BulkStatusBadge";
import { formatDate } from "@/lib/helpers";
import type { BulkExecution } from "@/types/bulk";

type BulkExecutionsListProps = {
  executions: BulkExecution[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onOpenLog: (execution: BulkExecution) => void;
};

export function BulkExecutionsList({
  executions,
  loading,
  error,
  onRefresh,
  onOpenLog,
}: BulkExecutionsListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-black">
          <FiZap className="h-4 w-4 text-[var(--muted)]" />
          {executions.length} execution{executions.length === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={onRefresh}
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
          Failed to load executions
        </div>
      ) : executions.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
          <FiInbox className="h-6 w-6 text-[var(--muted)]" />
          <span className="text-sm text-[var(--muted)]">
            No bulk executions yet
          </span>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <th className="px-4 py-2 font-medium">Upload</th>
              <th className="px-4 py-2 font-medium">Currency</th>
              <th className="px-4 py-2 font-medium">Input file</th>
              <th className="px-4 py-2 font-medium">Triggered by</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Started</th>
              <th className="px-4 py-2 font-medium">Last log</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {executions.map((e) => (
              <tr
                key={e.id}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td className="px-4 py-3 text-[var(--muted)]">#{e.uploadId}</td>
                <td className="px-4 py-3 font-medium text-black">
                  {e.currency}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                  {basename(e.inputFile)}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {e.triggeredBy ? (
                    <span className="flex flex-col">
                      <span className="text-black">
                        {e.triggeredBy.fullname || e.triggeredBy.username}
                      </span>
                      {e.triggeredBy.fullname ? (
                        <span className="text-xs">
                          @{e.triggeredBy.username}
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <BulkStatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {e.startedAt ? formatDate(e.startedAt) : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {e.lastLogUpdate ? formatDate(e.lastLogUpdate) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenLog(e)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    <FiFileText className="h-3.5 w-3.5" />
                    View log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function basename(p: string): string {
  const idx = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return idx === -1 ? p : p.slice(idx + 1);
}
