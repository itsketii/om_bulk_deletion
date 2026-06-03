import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, AUTH_TOKEN_COOKIE } from "@/lib/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get(AUTH_TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
