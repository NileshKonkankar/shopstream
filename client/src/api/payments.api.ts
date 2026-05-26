import { apiClient } from "./axios";
import { PaymentIntentResponse } from "../types";

export interface PaymentIntentPayload {
  amount: number;
  currency?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export const paymentsApi = {
  createIntent: async (
    payload: PaymentIntentPayload
  ): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post<PaymentIntentResponse>(
      "/api/payments/create-intent",
      payload
    );
    return response.data;
  },
  webhook: async (payload: unknown) => {
    const response = await apiClient.post("/api/payments/webhook", payload);
    return response.data;
  }
};
