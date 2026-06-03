"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadHistory } from "@/components/upload/UploadHistory";
import { useUploads } from "@/hooks/useUploads";

export function UploadsView() {
  const { uploads, loading, error, refresh } = useUploads();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-10">
      <PageHeader
        title="Uploads"
        description="Submit a new file or review previous runs."
      />

      <section className="rounded-lg border border-[var(--border)] bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-black">New upload</h2>
        <UploadForm onUploaded={() => refresh()} />
      </section>

      <UploadHistory
        uploads={uploads}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </div>
  );
}
