import type { BulkStatus } from "@/types/bulk";

const STYLES: Record<BulkStatus, string> = {
  PENDING: "bg-zinc-50 text-[var(--muted)] ring-[var(--border)]",
  RUNNING: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
};

const LABELS: Record<BulkStatus, string> = {
  PENDING: "Pending",
  RUNNING: "Running",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export function BulkStatusBadge({ status }: { status: BulkStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
