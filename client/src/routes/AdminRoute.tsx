import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { useAuthStore } from "../store/auth.store";

export const AdminRoute = () => {
  const { isAuthenticated, isAuthReady, user } = useAuthStore();

  if (!isAuthReady) {
    return <LoadingState label="Checking admin access" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate replace to="/products" />;
  }

  return <Outlet />;
};
