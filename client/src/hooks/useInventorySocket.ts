import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  connectInventorySocket,
  disconnectInventorySocket
} from "../sockets/inventory.socket";

export const useInventorySocket = (): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    connectInventorySocket(queryClient);

    return () => {
      disconnectInventorySocket();
    };
  }, [queryClient]);
};
