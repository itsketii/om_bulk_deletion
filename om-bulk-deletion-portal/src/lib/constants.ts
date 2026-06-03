export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export const AUTH_TOKEN_COOKIE = "om_auth_token";

export const ACCEPTED_UPLOAD_EXTENSIONS = [".xlsx", ".xls"] as const;

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const USER_ROLES = ["ADMIN", "USER"] as const;

export const MIN_PASSWORD_LENGTH = 8;
