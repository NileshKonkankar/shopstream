export type UserRole = "customer" | "admin";

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
}

export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  token: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  product: Product;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface OrderResponse {
  order: Order;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  todo?: string;
}

export interface InventoryUpdatePayload {
  productId: string;
  stock: number;
}
