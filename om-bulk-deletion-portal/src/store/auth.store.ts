import Cookies from "js-cookie";
import { AUTH_TOKEN_COOKIE } from "@/lib/constants";
import type { User } from "@/types/user";

const USER_STORAGE_KEY = "om_auth_user";

export const authStore = {
  getToken(): string | undefined {
    return Cookies.get(AUTH_TOKEN_COOKIE);
  },
  setToken(token: string): void {
    Cookies.set(AUTH_TOKEN_COOKIE, token, { sameSite: "lax" });
  },
  clearToken(): void {
    Cookies.remove(AUTH_TOKEN_COOKIE);
  },
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  setUser(user: User): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  clearUser(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(USER_STORAGE_KEY);
  },
};
