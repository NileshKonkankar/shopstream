import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useCartStore } from "../store/cart.store";
import {
  Cart,
  InventoryUpdatePayload,
  Product,
  ProductListResponse,
  ProductResponse
} from "../types";
import { getProductId } from "../utils/formatters";

let socket: Socket | null = null;

const applyStock = (product: Product, payload: InventoryUpdatePayload): Product =>
  getProductId(product) === payload.productId
    ? { ...product, stock: payload.stock }
    : product;

export const connectInventorySocket = (queryClient: QueryClient): Socket => {
  if (socket) {
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL, {
    transports: ["websocket"]
  });

  socket.off("inventory:update");
  socket.on("inventory:update", (payload: InventoryUpdatePayload) => {
    queryClient.setQueriesData<ProductListResponse>(
      { queryKey: ["products"] },
      (oldData) =>
        oldData
          ? {
              ...oldData,
              products: oldData.products.map((product) => applyStock(product, payload))
            }
          : oldData
    );

    queryClient.setQueryData<ProductResponse>(
      ["product", payload.productId],
      (oldData) =>
        oldData
          ? {
              product: applyStock(oldData.product, payload)
            }
          : oldData
    );

    queryClient.setQueryData<Cart>(["cart"], (oldData) =>
      oldData
        ? {
            ...oldData,
            items: oldData.items.map((item) =>
              getProductId(item.product) === payload.productId
                ? {
                    ...item,
                    product: {
                      ...item.product,
                      stock: payload.stock
                    }
                  }
                : item
            )
          }
        : oldData
    );

    useCartStore.getState().applyInventoryUpdate(payload.productId, payload.stock);
  });

  return socket;
};

export const initializeInventorySocket = connectInventorySocket;

export const disconnectInventorySocket = (): void => {
  socket?.disconnect();
  socket = null;
};
