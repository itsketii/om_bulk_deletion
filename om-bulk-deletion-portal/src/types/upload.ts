import type { GeneratedFileSummary } from "@/types/file";

export type UploadStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type Upload = {
  id: number;
  originalFilename: string;
  totalRecords: number;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
  files?: GeneratedFileSummary[];
};

export type UploadResult = {
  uploadId: number;
  totalRecords: number;
  status: UploadStatus;
  files: GeneratedFileSummary[];
};
