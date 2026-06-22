"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  FiCheck,
  FiDownload,
  FiInbox,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { PageHeader } from "@/components/layout/PageHeader";
import { RejectUploadDialog } from "@/components/validation/RejectUploadDialog";
import { useAuth } from "@/hooks/useAuth";
import { usePendingValidations } from "@/hooks/usePendingValidations";
import { formatDate } from "@/lib/helpers";
import {
  downloadOriginalUpload,
  validateUpload,
} from "@/services/upload.service";
import type { Upload } from "@/types/upload";

export function ValidationView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { uploads, loading, error, refresh } = usePendingValidations();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Upload | null>(null);

  const canAccess =
    user?.role === "SUPERADMIN" || user?.role === "VALIDATOR";

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canAccess) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, canAccess, router]);

  if (authLoading || !user || !canAccess) {
    return null;
  }

  async function onDownload(upload: Upload) {
    try {
      await downloadOriginalUpload(upload.id, upload.originalFilename);
    } catch {
      toast.error(`Failed to download ${upload.originalFilename}`);
    }
  }

  async function onValidate(upload: Upload) {
    setBusyId(upload.id);
    try {
      await validateUpload(upload.id);
      toast.success(`Validated ${upload.originalFilename}`);
      await refresh();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ??
          "Failed to validate upload"
        : "Failed to validate upload";
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-10">
      <PageHeader
        title="Validation"
        description="Review uploaded files and approve or reject them before bulk execution."
      />

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <span className="text-sm font-medium text-black">
            {uploads.length} pending upload{uploads.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={refresh}
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
            Failed to load pending uploads
          </div>
        ) : uploads.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <FiInbox className="h-6 w-6 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">
              Nothing to validate
            </span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-2 font-medium">File</th>
                <th className="px-4 py-2 font-medium">Uploader</th>
                <th className="px-4 py-2 font-medium">Records</th>
                <th className="px-4 py-2 font-medium">Submitted</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-black">
                    {u.originalFilename}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {u.uploader
                      ? u.uploader.fullname || u.uploader.username
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {u.totalRecords}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onDownload(u)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      >
                        <FiDownload className="h-3.5 w-3.5" />
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => onValidate(u)}
                        disabled={busyId === u.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Validate
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(u)}
                        disabled={busyId === u.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        <FiX className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RejectUploadDialog
        open={rejectTarget !== null}
        upload={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={refresh}
      />
    </div>
  );
}
