import { useEffect } from "react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export const useAuthBootstrap = (): void => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (!accessToken) {
        setAuthReady(true);
        return;
      }

      try {
        const user = await authApi.me();
        if (isMounted) {
          setUser(user);
        }
      } catch {
        if (isMounted) {
          logout();
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, logout, setAuthReady, setUser]);
};
