import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthReady: (isAuthReady: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAuthReady: false,
      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isAuthReady: true
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isAuthReady: true
        }),
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(user && state.accessToken),
          isAuthReady: true
        })),
      setAuthReady: (isAuthReady) => set({ isAuthReady })
    }),
    {
      name: "shopstream-auth"
    }
  )
);
