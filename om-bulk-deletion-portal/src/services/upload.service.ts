import { apiClient } from "@/services/api";
import type { Upload, UploadResult } from "@/types/upload";

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

export async function createUpload(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<ApiEnvelope<UploadResult>>(
    "/uploads",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}

export async function listUploads(): Promise<Upload[]> {
  const { data } = await apiClient.get<ApiEnvelope<Upload[]>>("/uploads");
  return data.data;
}

export async function getUpload(id: number | string): Promise<Upload> {
  const { data } = await apiClient.get<ApiEnvelope<Upload>>(`/uploads/${id}`);
  return data.data;
}

export async function listPendingValidationUploads(): Promise<Upload[]> {
  const { data } = await apiClient.get<ApiEnvelope<Upload[]>>(
    "/uploads/pending-validation",
  );
  return data.data;
}

export async function downloadOriginalUpload(
  id: number | string,
  filename: string,
): Promise<void> {
  const response = await apiClient.get<Blob>(
    `/uploads/${id}/download-original`,
    { responseType: "blob" },
  );
  const blob = response.data as unknown as Blob;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function validateUpload(
  id: number | string,
  comment?: string,
): Promise<Upload> {
  const { data } = await apiClient.post<ApiEnvelope<Upload>>(
    `/uploads/${id}/validate`,
    { comment: comment ?? null },
  );
  return data.data;
}

export async function rejectUpload(
  id: number | string,
  comment: string,
): Promise<Upload> {
  const { data } = await apiClient.post<ApiEnvelope<Upload>>(
    `/uploads/${id}/reject`,
    { comment },
  );
  return data.data;
}
