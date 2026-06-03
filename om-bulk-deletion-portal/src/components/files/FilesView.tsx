"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiInbox, FiRefreshCw } from "react-icons/fi";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFiles } from "@/hooks/useFiles";
import { useUploads } from "@/hooks/useUploads";
import { formatDate } from "@/lib/helpers";
import { getUpload } from "@/services/upload.service";
import type { GeneratedFileSummary, GeneratedFileType } from "@/types/file";

type Row = GeneratedFileSummary & {
  uploadId: number;
  originalFilename: string;
  createdAt: string;
};

export function FilesView() {
  const { uploads, loading, error, refresh } = useUploads();
  const { download, downloading } = useFiles();
  const [rows, setRows] = useState<Row[]>([]);
  const [hydrating, setHydrating] = useState(false);

  const completed = useMemo(
    () => uploads.filter((u) => u.status === "COMPLETED"),
    [uploads],
  );

  useEffect(() => {
    if (completed.length === 0) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setHydrating(true);
    Promise.all(completed.map((u) => getUpload(u.id).catch(() => null)))
      .then((details) => {
        if (cancelled) return;
        const flat: Row[] = [];
        details.forEach((d, idx) => {
          if (!d) return;
          const parent = completed[idx];
          (d.files ?? []).forEach((f) => {
            flat.push({
              ...f,
              uploadId: parent.id,
              originalFilename: parent.originalFilename,
              createdAt: parent.createdAt,
            });
          });
        });
        setRows(flat);
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [completed]);

  async function onDownload(r: Row) {
    try {
      await download(r.id, r.filename);
    } catch {
      toast.error(`Failed to download ${r.filename}`);
    }
  }

  const busy = loading || hydrating;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-10">
      <PageHeader
        title="Files"
        description="All generated CDF and USD outputs from completed uploads."
      />

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="text-sm font-medium text-black">
            {rows.length} file{rows.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-zinc-50 hover:text-black disabled:opacity-50"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="px-4 py-8 text-center text-sm text-red-600">
            Failed to load files
          </div>
        ) : rows.length === 0 && !busy ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <FiInbox className="h-6 w-6 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">
              No generated files yet
            </span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-2 font-medium">Filename</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Generated</th>
                <th className="px-4 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 text-black">{r.filename}</td>
                  <td className="px-4 py-3">
                    <TypeChip type={r.type} />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {r.originalFilename}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDownload(r)}
                      disabled={downloading}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60"
                    >
                      <FiDownload className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TypeChip({ type }: { type: GeneratedFileType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand)] ring-1 ring-inset ring-[var(--brand)]/20">
      {type}
    </span>
  );
}
