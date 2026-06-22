import type { ValidationStatus } from "@/types/upload";

const STYLES: Record<ValidationStatus, string> = {
  PENDING_VALIDATION: "bg-amber-50 text-amber-700 ring-amber-200",
  VALIDATED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
};

const LABELS: Record<ValidationStatus, string> = {
  PENDING_VALIDATION: "Pending validation",
  VALIDATED: "Validated",
  REJECTED: "Rejected",
};

export function ValidationStatusBadge({
  status,
}: {
  status: ValidationStatus | null | undefined;
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-xs font-medium text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]">
        —
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
