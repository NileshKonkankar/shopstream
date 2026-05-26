import { apiClient } from "./axios";
import { OrderResponse, OrdersResponse } from "../types";

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const ordersApi = {
  getMyOrders: async (): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>("/api/orders/my");
    return response.data;
  },
  getAllOrders: async (): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>("/api/orders");
    return response.data;
  },
  createOrder: async (payload: CreateOrderPayload): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>("/api/orders", payload);
    return response.data;
  }
};
