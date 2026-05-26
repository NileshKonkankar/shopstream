import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../api/cart.api";
import { useAuthStore } from "../store/auth.store";
import { useCartStore } from "../store/cart.store";
import { Product } from "../types";
import { getApiErrorMessage } from "../utils/error";
import { getProductId } from "../utils/formatters";

export const useCartActions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const localAddItem = useCartStore((state) => state.addItem);
  const setCart = useCartStore((state) => state.setCart);
  const setErrorMessage = useCartStore((state) => state.setErrorMessage);

  const invalidateCart = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: async (cart) => {
      setCart(cart.items);
      await invalidateCart();
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error));
    }
  });

  const addToCart = (product: Product, quantity = 1) => {
    const productId = getProductId(product);

    if (!productId) {
      setErrorMessage("This product cannot be added right now.");
      return;
    }

    if (quantity > product.stock) {
      setErrorMessage(`${product.title} only has ${product.stock} item(s) available.`);
      return;
    }

    if (!isAuthenticated) {
      localAddItem(product, quantity);
      navigate("/login");
      return;
    }

    addMutation.mutate({ productId, quantity });
  };

  return {
    addToCart,
    isAdding: addMutation.isPending
  };
};
