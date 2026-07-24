export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export const AUTH_TOKEN_COOKIE = "om_auth_token";

export const ACCEPTED_UPLOAD_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const USER_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "VALIDATOR",
  "USER",
] as const;

export const USER_MANAGEMENT_ROLES = ["SUPERADMIN"] as const;

export const BULK_EXECUTION_ROLES = ["SUPERADMIN", "ADMIN"] as const;

export const VALIDATION_ROLES = ["SUPERADMIN", "VALIDATOR"] as const;

export const PRIVILEGED_READ_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "VALIDATOR",
] as const;

export const MIN_PASSWORD_LENGTH = 8;
