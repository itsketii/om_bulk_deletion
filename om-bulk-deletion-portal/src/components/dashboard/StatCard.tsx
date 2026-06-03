import type { IconType } from "react-icons";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: IconType;
  hint?: string;
};

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-[var(--border)] bg-white p-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          {label}
        </span>
        <span className="text-2xl font-semibold text-black">{value}</span>
        {hint ? (
          <span className="text-xs text-[var(--muted)]">{hint}</span>
        ) : null}
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-soft)]">
        <Icon className="h-4 w-4 text-[var(--brand)]" />
      </span>
    </div>
  );
}
