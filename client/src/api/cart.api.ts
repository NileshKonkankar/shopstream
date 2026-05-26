import { apiClient } from "./axios";
import { Cart, Product } from "../types";

interface RawCartItem {
  productId: Product | string;
  quantity: number;
}

interface RawCart {
  _id?: string;
  userId?: string;
  items?: RawCartItem[];
}

interface CartResponse {
  cart: RawCart | null;
}

const isProduct = (value: Product | string): value is Product =>
  typeof value === "object" && value !== null;

export const normalizeCart = (rawCart: RawCart | null | undefined): Cart => ({
  _id: rawCart?._id,
  userId: rawCart?.userId,
  items:
    rawCart?.items
      ?.filter((item) => isProduct(item.productId))
      .map((item) => ({
        product: item.productId as Product,
        quantity: item.quantity
      })) ?? []
});

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<CartResponse>("/api/cart");
    return normalizeCart(response.data.cart);
  },
  addItem: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.post<CartResponse>("/api/cart/items", {
      productId,
      quantity
    });
    return normalizeCart(response.data.cart);
  },
  updateItem: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put<CartResponse>(`/api/cart/items/${productId}`, {
      quantity
    });
    return normalizeCart(response.data.cart);
  },
  removeItem: async (productId: string): Promise<Cart> => {
    const response = await apiClient.delete<CartResponse>(`/api/cart/items/${productId}`);
    return normalizeCart(response.data.cart);
  },
  clear: async (): Promise<Cart> => {
    const response = await apiClient.delete<CartResponse>("/api/cart");
    return normalizeCart(response.data.cart);
  }
};
