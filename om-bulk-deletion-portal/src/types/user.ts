export type UserRole = "ADMIN" | "USER";

export type User = {
  id: number;
  username: string;
  fullname?: string | null;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserPayload = {
  username: string;
  fullname?: string;
  email: string;
  password: string;
  role: UserRole;
};
