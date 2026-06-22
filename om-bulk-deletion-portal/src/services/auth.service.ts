import { apiClient } from "@/services/api";
import type { User } from "@/types/user";

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

export type LoginPayload = { username: string; password: string };
export type LoginResponse = { token: string; user: User };

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiEnvelope<LoginResponse>>(
    "/auth/login",
    payload,
  );
  return data.data;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<ApiEnvelope<User>>("/auth/profile");
  return data.data;
}

export type UpdateProfilePayload = {
  fullname?: string | null;
  email?: string;
};

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  const { data } = await apiClient.patch<ApiEnvelope<User>>(
    "/auth/profile",
    payload,
  );
  return data.data;
}

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  await apiClient.post<ApiEnvelope<User>>("/auth/change-password", payload);
}

export async function logout(): Promise<void> {
  // No backend endpoint yet; client-side token clearing is handled in the store.
}
