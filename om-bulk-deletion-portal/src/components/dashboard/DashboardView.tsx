"use client";

import { useMemo } from "react";
import { FiUpload, FiCheckCircle, FiAlertCircle, FiFile } from "react-icons/fi";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadHistory } from "@/components/upload/UploadHistory";
import { useUploads } from "@/hooks/useUploads";

export function DashboardView() {
  const { uploads, loading, error, refresh } = useUploads();

  const stats = useMemo(() => {
    const total = uploads.length;
    const completed = uploads.filter((u) => u.status === "COMPLETED").length;
    const failed = uploads.filter((u) => u.status === "FAILED").length;
    const records = uploads.reduce((sum, u) => sum + (u.totalRecords ?? 0), 0);
    return { total, completed, failed, records };
  }, [uploads]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-10">
      <PageHeader
        title="Overview"
        description="Upload Excel files and download generated CDF / USD outputs."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total uploads" value={stats.total} icon={FiUpload} />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={FiCheckCircle}
        />
        <StatCard label="Failed" value={stats.failed} icon={FiAlertCircle} />
        <StatCard label="Records processed" value={stats.records} icon={FiFile} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-lg border border-[var(--border)] bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-black">
            New upload
          </h2>
          <UploadForm onUploaded={() => refresh()} />
        </section>

        <section className="lg:col-span-3">
          <UploadHistory
            uploads={uploads}
            loading={loading}
            error={error}
            onRefresh={refresh}
            limit={5}
          />
        </section>
      </div>
    </div>
  );
}
