"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import { Modal } from "@/components/ui/Modal";
import { BulkStatusBadge } from "@/components/bulk/BulkStatusBadge";
import {
  downloadBulkReport,
  getBulkExecutionLog,
} from "@/services/bulk.service";
import { formatBytes, formatDate } from "@/lib/helpers";
import type {
  BulkExecution,
  BulkExecutionLog,
  BulkReportKind,
} from "@/types/bulk";

type LogViewerDialogProps = {
  open: boolean;
  execution: BulkExecution | null;
  onClose: () => void;
};

const POLL_INTERVAL_MS = 5000;

export function LogViewerDialog({
  open,
  execution,
  onClose,
}: LogViewerDialogProps) {
  const [log, setLog] = useState<BulkExecutionLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [downloadingKind, setDownloadingKind] =
    useState<BulkReportKind | null>(null);
  const scrollRef = useRef<HTMLPreElement>(null);

  const handleDownloadReport = useCallback(
    async (kind: BulkReportKind) => {
      if (!execution) return;
      setDownloadingKind(kind);
      try {
        const blob = await downloadBulkReport(execution.id, kind);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const base = execution.logFile
          .split(/[\\/]/)
          .pop()
          ?.replace(/\.log$/i, "") ?? `execution-${execution.id}`;
        a.download = `${base}.${kind}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error(`Failed to download ${kind} report`);
      } finally {
        setDownloadingKind(null);
      }
    },
    [execution],
  );

  const fetchLog = useCallback(async () => {
    if (!execution) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBulkExecutionLog(execution.id);
      setLog(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [execution]);

  useEffect(() => {
    if (!open || !execution) return;
    setLog(null);
    void fetchLog();
  }, [open, execution, fetchLog]);

  useEffect(() => {
    if (!open || !autoRefresh || !execution) return;
    if (execution.status !== "RUNNING" && execution.status !== "PENDING") {
      if (log && (log.status === "COMPLETED" || log.status === "FAILED")) {
        return;
      }
    }
    const id = setInterval(() => {
      void fetchLog();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, autoRefresh, execution, log, fetchLog]);

  useEffect(() => {
    if (!log || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [log]);

  if (!execution) return null;

  const currentStatus = log?.status ?? execution.status;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Log — ${execution.currency}`}
      description={execution.inputFile}
      size="xl"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BulkStatusBadge status={currentStatus} />
            <span className="text-xs text-[var(--muted)]">
              {log ? (
                <>
                  {formatBytes(log.size)}
                  {log.truncated ? " (tail)" : ""}
                  {log.modifiedAt
                    ? ` · updated ${formatDate(log.modifiedAt)}`
                    : ""}
                </>
              ) : (
                "—"
              )}
            </span>
            {execution.triggeredBy ? (
              <span className="text-xs text-[var(--muted)]">
                · triggered by{" "}
                <span className="text-black">
                  {execution.triggeredBy.fullname ||
                    execution.triggeredBy.username}
                </span>
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-3.5 w-3.5 accent-[var(--brand)]"
              />
              Auto-refresh
            </label>
            <button
              type="button"
              onClick={fetchLog}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60"
            >
              <FiRefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Failed to load log
          </div>
        ) : null}

        {execution.status === "COMPLETED" ? (
          <div className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] bg-zinc-50 p-3 sm:grid-cols-3">
            <div>
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Currency
              </span>
              <div className="mt-0.5 text-sm font-semibold text-black">
                {execution.currency}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Success
              </span>
              <div className="mt-0.5 text-sm font-semibold text-emerald-700">
                ✓ {execution.successCount ?? 0}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Failed
              </span>
              <div className="mt-0.5 text-sm font-semibold text-red-700">
                ✗ {execution.failedCount ?? 0}
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReport("success")}
                  disabled={downloadingKind !== null}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:border-emerald-300 disabled:opacity-60"
                >
                  <FiDownload className="h-3.5 w-3.5" />
                  Success CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReport("failed")}
                  disabled={downloadingKind !== null}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-red-700 transition hover:border-red-300 disabled:opacity-60"
                >
                  <FiDownload className="h-3.5 w-3.5" />
                  Failed CSV
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <pre
          ref={scrollRef}
          className="h-[480px] overflow-auto rounded-md border border-[var(--border)] bg-black p-4 font-mono text-xs leading-relaxed text-emerald-200"
        >
          {log?.content && log.content.length > 0
            ? log.content
            : loading
              ? "Loading…"
              : "(log is empty)"}
        </pre>

        <p className="text-xs text-[var(--muted)]">
          Showing tail of <span className="text-black">{execution.logFile}</span>
        </p>
      </div>
    </Modal>
  );
}
