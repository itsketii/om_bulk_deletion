"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiRefreshCw, FiInbox, FiFileText } from "react-icons/fi";
import { BulkExecuteButton } from "@/components/bulk/BulkExecuteButton";
import { BulkStatusBadge } from "@/components/bulk/BulkStatusBadge";
import { LogViewerDialog } from "@/components/bulk/LogViewerDialog";
import { StatusBadge } from "@/components/upload/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useFiles } from "@/hooks/useFiles";
import { formatDate } from "@/lib/helpers";
import { getUpload } from "@/services/upload.service";
import { listBulkExecutionsByUpload } from "@/services/bulk.service";
import type { BulkCurrency, BulkExecution } from "@/types/bulk";
import type { GeneratedFileSummary } from "@/types/file";
import type { Upload } from "@/types/upload";

const BULK_POLL_INTERVAL_MS = 5000;

const BLOCKING_BULK_STATUSES = new Set(["PENDING", "RUNNING", "COMPLETED"]);

type UploadHistoryProps = {
  uploads: Upload[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  limit?: number;
};

export function UploadHistory({
  uploads,
  loading,
  error,
  onRefresh,
  limit,
}: UploadHistoryProps) {
  const rows = limit ? uploads.slice(0, limit) : uploads;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="text-sm font-medium text-black">Recent uploads</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-zinc-50 hover:text-black disabled:opacity-50"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="px-4 py-8 text-center text-sm text-red-600">
          Failed to load uploads
        </div>
      ) : rows.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
          <FiInbox className="h-6 w-6 text-[var(--muted)]" />
          <span className="text-sm text-[var(--muted)]">No uploads yet</span>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <th className="px-4 py-2 font-medium">File</th>
              <th className="px-4 py-2 font-medium">Records</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Bulk</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <UploadRow key={u.id} upload={u} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UploadRow({ upload }: { upload: Upload }) {
  const { user } = useAuth();
  const { download, downloading } = useFiles();
  const [files, setFiles] = useState<GeneratedFileSummary[] | null>(
    upload.files ?? null,
  );
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [executions, setExecutions] = useState<BulkExecution[] | null>(null);
  const [logTarget, setLogTarget] = useState<BulkExecution | null>(null);
  const isAdmin = user?.role === "ADMIN";

  const fetchExecutions = useCallback(async () => {
    try {
      const result = await listBulkExecutionsByUpload(upload.id);
      setExecutions(result);
    } catch {
      setExecutions([]);
    }
  }, [upload.id]);

  useEffect(() => {
    if (files !== null || upload.status !== "COMPLETED") return;
    let cancelled = false;
    setLoadingFiles(true);
    getUpload(upload.id)
      .then((full) => {
        if (!cancelled) setFiles(full.files ?? []);
      })
      .catch(() => {
        if (!cancelled) setFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFiles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [upload.id, upload.status, files]);

  useEffect(() => {
    if (upload.status !== "COMPLETED") return;
    void fetchExecutions();
  }, [upload.status, fetchExecutions]);

  const hasActive = (executions ?? []).some(
    (e) => e.status === "PENDING" || e.status === "RUNNING",
  );

  useEffect(() => {
    if (!hasActive) return;
    const id = setInterval(() => {
      void fetchExecutions();
    }, BULK_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasActive, fetchExecutions]);

  const hasBlocking = (executions ?? []).some((e) =>
    BLOCKING_BULK_STATUSES.has(e.status),
  );

  async function onDownload(f: GeneratedFileSummary) {
    try {
      await download(f.id, f.filename);
    } catch {
      toast.error(`Failed to download ${f.filename}`);
    }
  }

  return (
    <>
      <tr className="border-b border-[var(--border)] last:border-0">
        <td className="px-4 py-3 text-black">{upload.originalFilename}</td>
        <td className="px-4 py-3 text-[var(--muted)]">{upload.totalRecords}</td>
        <td className="px-4 py-3">
          <StatusBadge status={upload.status} />
        </td>
        <td className="px-4 py-3">
          {upload.status !== "COMPLETED" ? (
            <span className="text-xs text-[var(--muted)]">—</span>
          ) : executions === null ? (
            <span className="text-xs text-[var(--muted)]">Loading…</span>
          ) : executions.length === 0 ? (
            <span className="text-xs text-[var(--muted)]">Not run</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {(["CDF", "USD"] as BulkCurrency[]).map((c) => {
                const exec = executions.find((e) => e.currency === c);
                if (!exec) return null;
                return (
                  <button
                    key={exec.id}
                    type="button"
                    onClick={() => setLogTarget(exec)}
                    title={`View log — ${c}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-1 py-0.5 transition hover:border-[var(--border)]"
                  >
                    <span className="text-xs font-medium text-black">{c}</span>
                    <BulkStatusBadge status={exec.status} />
                    <FiFileText className="h-3 w-3 text-[var(--muted)]" />
                  </button>
                );
              })}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-[var(--muted)]">
          {formatDate(upload.createdAt)}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {upload.status !== "COMPLETED" ? (
              <span className="text-xs text-[var(--muted)]">—</span>
            ) : loadingFiles ? (
              <span className="text-xs text-[var(--muted)]">Loading…</span>
            ) : (
              <>
                {(files ?? []).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onDownload(f)}
                    disabled={downloading}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60"
                  >
                    <FiDownload className="h-3.5 w-3.5" />
                    {f.type}
                  </button>
                ))}
                {isAdmin && (files?.length ?? 0) > 0 && !hasBlocking ? (
                  <BulkExecuteButton
                    uploadId={upload.id}
                    size="sm"
                    onLaunched={() => {
                      void fetchExecutions();
                    }}
                  />
                ) : null}
              </>
            )}
          </div>
        </td>
      </tr>
      <LogViewerDialog
        open={logTarget !== null}
        execution={logTarget}
        onClose={() => setLogTarget(null)}
      />
    </>
  );
}
