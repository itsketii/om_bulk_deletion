import { apiClient } from "@/services/api";
import type { CreateUserPayload, User } from "@/types/user";

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

export async function listUsers(): Promise<User[]> {
  const { data } = await apiClient.get<ApiEnvelope<User[]>>("/users");
  return data.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post<ApiEnvelope<User>>("/users", payload);
  return data.data;
}

export async function resetUserPassword(
  userId: number | string,
  newPassword: string,
): Promise<User> {
  const { data } = await apiClient.patch<ApiEnvelope<User>>(
    `/users/${userId}/reset-password`,
    { newPassword },
  );
  return data.data;
}
