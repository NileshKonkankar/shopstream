import { apiClient } from "./axios";
import { Product, ProductListResponse, ProductResponse } from "../types";

export interface ProductFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export type ProductPayload = Omit<Product, "_id" | "id" | "createdAt" | "updatedAt">;

export const productsApi = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
    const response = await apiClient.get<ProductListResponse>("/api/products", {
      params: filters
    });
    return response.data;
  },
  getProduct: async (id: string): Promise<ProductResponse> => {
    const response = await apiClient.get<ProductResponse>(`/api/products/${id}`);
    return response.data;
  },
  createProduct: async (payload: ProductPayload): Promise<ProductResponse> => {
    const response = await apiClient.post<ProductResponse>("/api/products", payload);
    return response.data;
  },
  updateProduct: async (
    id: string,
    payload: Partial<ProductPayload>
  ): Promise<ProductResponse> => {
    const response = await apiClient.put<ProductResponse>(`/api/products/${id}`, payload);
    return response.data;
  },
  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/products/${id}`);
    return response.data;
  }
};
