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
