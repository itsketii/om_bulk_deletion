"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { FiUploadCloud, FiX, FiFile } from "react-icons/fi";
import { createUpload } from "@/services/upload.service";
import { isValidUploadFile } from "@/lib/validators";
import { formatBytes } from "@/lib/helpers";
import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_BYTES,
} from "@/lib/constants";
import type { UploadResult } from "@/types/upload";

type UploadFormProps = {
  onUploaded?: (result: UploadResult) => void;
};

export function UploadForm({ onUploaded }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  function setSelected(next: File | null) {
    if (!next) {
      setFile(null);
      return;
    }
    if (!isValidUploadFile(next)) {
      toast.error(
        `Unsupported file type — accepted: ${ACCEPTED_UPLOAD_EXTENSIONS.join(", ")}`,
      );
      return;
    }
    if (next.size > MAX_UPLOAD_BYTES) {
      toast.error(`File exceeds ${formatBytes(MAX_UPLOAD_BYTES)} limit`);
      return;
    }
    setFile(next);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    setSelected(e.target.files?.[0] ?? null);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    setSelected(e.dataTransfer.files?.[0] ?? null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createUpload(file);
      toast.success(`Processed ${result.totalRecords} record(s)`);
      setFile(null);
      onUploaded?.(result);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          "Upload failed"
        : "Upload failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-[var(--brand)] bg-[var(--brand-soft)]"
            : "border-[var(--border)] bg-white hover:border-black/40"
        }`}
      >
        <FiUploadCloud className="h-8 w-8 text-[var(--brand)]" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-black">
            Drop an Excel or CSV file, or click to browse
          </span>
          <span className="text-xs text-[var(--muted)]">
            {ACCEPTED_UPLOAD_EXTENSIONS.join(", ")} · up to{" "}
            {formatBytes(MAX_UPLOAD_BYTES)}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_EXTENSIONS.join(",")}
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-white px-4 py-3">
          <FiFile className="h-4 w-4 text-[var(--muted)]" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-black">
              {file.name}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {formatBytes(file.size)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            aria-label="Remove file"
            className="rounded p-1 text-[var(--muted)] transition hover:text-black"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!file || submitting}
        className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Uploading…
          </span>
        ) : (
          "Upload & process"
        )}
      </button>
    </form>
  );
}
