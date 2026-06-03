import { apiClient } from "@/services/api";
import type {
  BulkExecuteResult,
  BulkExecution,
  BulkExecutionLog,
  BulkExecutionStatus,
} from "@/types/bulk";

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

export async function executeBulk(
  uploadId: number | string,
): Promise<BulkExecuteResult> {
  const { data } = await apiClient.post<ApiEnvelope<BulkExecuteResult>>(
    `/bulk/${uploadId}/execute`,
  );
  return data.data;
}

export async function listBulkExecutions(): Promise<BulkExecution[]> {
  const { data } = await apiClient.get<ApiEnvelope<BulkExecution[]>>("/bulk");
  return data.data;
}

export async function listBulkExecutionsByUpload(
  uploadId: number | string,
): Promise<BulkExecution[]> {
  const { data } = await apiClient.get<ApiEnvelope<BulkExecution[]>>(
    `/bulk/by-upload/${uploadId}`,
  );
  return data.data;
}

export async function getBulkExecution(
  id: number | string,
): Promise<BulkExecution> {
  const { data } = await apiClient.get<ApiEnvelope<BulkExecution>>(
    `/bulk/${id}`,
  );
  return data.data;
}

export async function getBulkExecutionStatus(
  id: number | string,
): Promise<BulkExecutionStatus> {
  const { data } = await apiClient.get<ApiEnvelope<BulkExecutionStatus>>(
    `/bulk/${id}/status`,
  );
  return data.data;
}

export async function getBulkExecutionLog(
  id: number | string,
): Promise<BulkExecutionLog> {
  const { data } = await apiClient.get<ApiEnvelope<BulkExecutionLog>>(
    `/bulk/${id}/log`,
  );
  return data.data;
}
