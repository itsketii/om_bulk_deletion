import { apiClient } from "@/services/api";

export async function downloadGeneratedFile(id: number | string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/files/${id}/download`, {
    responseType: "blob",
  });
  return data;
}
