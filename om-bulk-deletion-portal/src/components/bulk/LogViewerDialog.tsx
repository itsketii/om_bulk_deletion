"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Modal } from "@/components/ui/Modal";
import { BulkStatusBadge } from "@/components/bulk/BulkStatusBadge";
import { getBulkExecutionLog } from "@/services/bulk.service";
import { formatBytes, formatDate } from "@/lib/helpers";
import type { BulkExecution, BulkExecutionLog } from "@/types/bulk";

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
  const scrollRef = useRef<HTMLPreElement>(null);

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
