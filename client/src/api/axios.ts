import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "../store/auth.store";

const getPersistedToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const persistedAuth = window.localStorage.getItem("shopstream-auth");
    if (!persistedAuth) {
      return null;
    }

    const parsed = JSON.parse(persistedAuth) as {
      state?: { accessToken?: string | null };
    };

    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken ?? getPersistedToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);
