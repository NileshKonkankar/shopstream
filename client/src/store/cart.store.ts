import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "../types";
import { getProductId } from "../utils/formatters";

interface CartState {
  items: CartItem[];
  stockWarnings: Record<string, string>;
  errorMessage: string | null;
  setCart: (items: CartItem[]) => void;
  addItem: (product: Product, quantity?: number) => void;
  applyInventoryUpdate: (productId: string, stock: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  setStockWarning: (productId: string, message: string) => void;
  clearStockWarning: (productId: string) => void;
  setErrorMessage: (message: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      stockWarnings: {},
      errorMessage: null,
      setCart: (items) =>
        set({
          items,
          stockWarnings: items.reduce<Record<string, string>>((warnings, item) => {
            const productId = getProductId(item.product);

            if (item.quantity > item.product.stock) {
              warnings[productId] =
                `Only ${item.product.stock} item(s) left in stock. Please update your cart quantity.`;
            }

            return warnings;
          }, {}),
          errorMessage: null
        }),
      addItem: (product, quantity = 1) =>
        set((state) => {
          const productId = getProductId(product);
          const existingItem = state.items.find(
            (item) => getProductId(item.product) === productId
          );
          const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

          if (nextQuantity > product.stock) {
            return {
              errorMessage: `${product.title} only has ${product.stock} item(s) available.`
            };
          }

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                getProductId(item.product) === productId
                  ? { ...item, quantity: nextQuantity }
                  : item
              ),
              errorMessage: null
            };
          }

          return {
            items: [...state.items, { product, quantity }],
            errorMessage: null
          };
        }),
      applyInventoryUpdate: (productId, stock) =>
        set((state) => {
          const nextWarnings = { ...state.stockWarnings };
          const nextItems = state.items.map((item) => {
            if (getProductId(item.product) !== productId) {
              return item;
            }

            if (item.quantity > stock) {
              nextWarnings[productId] =
                `Only ${stock} item(s) left in stock. Please update your cart quantity.`;
            } else {
              delete nextWarnings[productId];
            }

            return {
              ...item,
              product: {
                ...item.product,
                stock
              }
            };
          });

          return {
            items: nextItems,
            stockWarnings: nextWarnings
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            getProductId(item.product) === productId
              ? {
                  ...item,
                  quantity: Math.min(Math.max(1, quantity), item.product.stock)
                }
              : item
          ),
          stockWarnings: Object.fromEntries(
            Object.entries(state.stockWarnings).filter(([key]) => key !== productId)
          ),
          errorMessage: null
        })),
      removeItem: (productId) =>
        set((state) => {
          const nextWarnings = { ...state.stockWarnings };
          delete nextWarnings[productId];

          return {
            items: state.items.filter((item) => getProductId(item.product) !== productId),
            stockWarnings: nextWarnings,
            errorMessage: null
          };
        }),
      clearCart: () => set({ items: [], stockWarnings: {}, errorMessage: null }),
      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),
      setStockWarning: (productId, message) =>
        set((state) => ({
          stockWarnings: {
            ...state.stockWarnings,
            [productId]: message
          }
        })),
      clearStockWarning: (productId) =>
        set((state) => {
          const nextWarnings = { ...state.stockWarnings };
          delete nextWarnings[productId];

          return { stockWarnings: nextWarnings };
        }),
      setErrorMessage: (message) => set({ errorMessage: message })
    }),
    {
      name: "shopstream-cart"
    }
  )
);
