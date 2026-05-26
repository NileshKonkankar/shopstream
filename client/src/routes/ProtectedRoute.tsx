import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { useAuthStore } from "../store/auth.store";

export const ProtectedRoute = () => {
  const { isAuthenticated, isAuthReady } = useAuthStore();
  const location = useLocation();

  if (!isAuthReady) {
    return <LoadingState label="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
};
