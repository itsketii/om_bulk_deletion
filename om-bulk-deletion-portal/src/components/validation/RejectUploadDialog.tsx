"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Modal } from "@/components/ui/Modal";
import { rejectUpload } from "@/services/upload.service";
import type { Upload } from "@/types/upload";

type RejectUploadDialogProps = {
  open: boolean;
  upload: Upload | null;
  onClose: () => void;
  onRejected: () => void;
};

export function RejectUploadDialog({
  open,
  upload,
  onClose,
  onRejected,
}: RejectUploadDialogProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) setComment("");
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!upload) return;
    if (!comment.trim()) {
      toast.error("A reason is required to reject");
      return;
    }
    setSubmitting(true);
    try {
      await rejectUpload(upload.id, comment.trim());
      toast.success(`Rejected ${upload.originalFilename}`);
      onRejected();
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Failed to reject upload"
        : "Failed to reject upload";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject upload"
      description={
        upload
          ? `Provide a reason for rejecting ${upload.originalFilename}.`
          : undefined
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-black">Reason</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            rows={4}
            className="w-full resize-none rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-[var(--muted)] outline-none transition focus:border-black focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-60"
            placeholder="Explain why this file cannot be validated"
          />
        </label>
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-black disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
