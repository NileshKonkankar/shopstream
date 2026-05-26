import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { cartApi } from "../../api/cart.api";
import { CartItemRow } from "../../components/cart/CartItemRow";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { useCartStore } from "../../store/cart.store";
import { getApiErrorMessage } from "../../utils/error";
import { formatCurrency } from "../../utils/formatters";

export const CartPage = () => {
  const queryClient = useQueryClient();
  const {
    items,
    stockWarnings,
    errorMessage,
    setCart,
    getTotal,
    clearStockWarning,
    setErrorMessage
  } = useCartStore();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart
  });

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data.items);
    }
  }, [cartQuery.data, setCart]);

  const invalidateCart = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateItem(productId, quantity),
    onSuccess: async (cart, variables) => {
      setCart(cart.items);
      clearStockWarning(variables.productId);
      await invalidateCart();
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error))
  });

  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: async (cart, productId) => {
      setCart(cart.items);
      clearStockWarning(productId);
      await invalidateCart();
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error))
  });

  const clearMutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: async (cart) => {
      setCart(cart.items);
      await invalidateCart();
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error))
  });

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const item = items.find((entry) => entry.product._id === productId);

    if (!item) {
      return;
    }

    if (quantity > item.product.stock) {
      setErrorMessage(`${item.product.title} only has ${item.product.stock} item(s) available.`);
      return;
    }

    updateMutation.mutate({ productId, quantity: Math.max(1, quantity) });
  };

  if (cartQuery.isLoading) {
    return <LoadingState label="Loading cart" />;
  }

  return (
    <section className="container-page py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Cart</h1>
          <p className="mt-2 text-slate-600">Review quantities before checkout.</p>
        </div>
        {items.length > 0 && (
          <button
            className="btn-secondary"
            disabled={clearMutation.isPending}
            onClick={() => clearMutation.mutate()}
            type="button"
          >
            Clear cart
          </button>
        )}
      </div>

      {cartQuery.isError && (
        <div className="mb-5">
          <ErrorState message={getApiErrorMessage(cartQuery.error)} />
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          message="Add products to your cart to begin checkout."
          title="Your cart is empty"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="card p-4">
            {items.map((item) => (
              <div key={item.product._id}>
                <CartItemRow
                  item={item}
                  onRemove={(productId) => removeMutation.mutate(productId)}
                  onUpdate={handleUpdateQuantity}
                />
                {stockWarnings[item.product._id] && (
                  <div className="-mt-2 mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p className="flex-1">{stockWarnings[item.product._id]}</p>
                    <button
                      className="font-semibold text-amber-900"
                      onClick={() => clearStockWarning(item.product._id)}
                      type="button"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <aside className="card h-fit p-5">
            <h2 className="text-lg font-semibold text-slate-950">Order summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5 text-lg font-bold text-slate-950">
              <span>Total</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
            <Link className="btn-primary mt-5 w-full" to="/checkout">
              Checkout
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
};
