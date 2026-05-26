import { AppRoutes } from "./routes/AppRoutes";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import { useInventorySocket } from "./hooks/useInventorySocket";

export const App = () => {
  useAuthBootstrap();
  useInventorySocket();

  return <AppRoutes />;
};
