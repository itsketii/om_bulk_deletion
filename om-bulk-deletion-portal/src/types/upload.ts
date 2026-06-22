import type { GeneratedFileSummary } from "@/types/file";
import type { UserRole } from "@/types/user";

export type UploadStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export type ValidationStatus =
  | "PENDING_VALIDATION"
  | "VALIDATED"
  | "REJECTED";

export type UploadUserSummary = {
  id: number;
  username: string;
  fullname?: string | null;
  role: UserRole;
};

export type Upload = {
  id: number;
  originalFilename: string;
  totalRecords: number;
  status: UploadStatus;
  validationStatus?: ValidationStatus | null;
  validatedById?: number | null;
  validatedBy?: UploadUserSummary | null;
  validatedAt?: string | null;
  validationComment?: string | null;
  userId?: number | null;
  uploader?: UploadUserSummary | null;
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
