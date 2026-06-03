"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { FiPlay } from "react-icons/fi";
import { executeBulk } from "@/services/bulk.service";

type BulkExecuteButtonProps = {
  uploadId: number | string;
  disabled?: boolean;
  size?: "sm" | "md";
  onLaunched?: () => void;
};

export function BulkExecuteButton({
  uploadId,
  disabled = false,
  size = "md",
  onLaunched,
}: BulkExecuteButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  async function onClick() {
    setSubmitting(true);
    try {
      const result = await executeBulk(uploadId);
      const launched = result.executions.length;
      const failed = result.errors.length;
      if (failed > 0 && launched === 0) {
        toast.error("Bulk execution failed");
      } else if (failed > 0) {
        toast.error(`Launched ${launched}, ${failed} failed`);
      } else {
        toast.success(`Bulk execution launched (${launched})`);
      }
      onLaunched?.();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Failed to launch bulk execution"
        : "Failed to launch bulk execution";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const classes =
    size === "sm"
      ? "inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-black transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
      : "inline-flex h-10 items-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || submitting}
      className={classes}
    >
      <FiPlay className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {submitting ? "Launching…" : "Run bulk"}
    </button>
  );
}
