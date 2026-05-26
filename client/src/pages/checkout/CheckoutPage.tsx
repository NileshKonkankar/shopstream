import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShieldCheck, ShoppingBag, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { cartApi } from "../../api/cart.api";
import { paymentsApi } from "../../api/payments.api";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { useCartStore } from "../../store/cart.store";
import { getApiErrorMessage } from "../../utils/error";
import { formatCurrency, getProductId } from "../../utils/formatters";

// Initialize Stripe outside component render to avoid recreating it
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Premium custom Stripe appearance
const stripeAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#4f46e5", // Indigo 600
    colorBackground: "#ffffff",
    colorText: "#0f172a", // Slate 900
    colorDanger: "#ef4444",
    fontFamily: "Outfit, Inter, system-ui, sans-serif",
    borderRadius: "0.5rem"
  }
};

/**
 * Inner form component for Stripe elements payment confirmation
 */
const StripeCheckoutForm = ({ totalAmount }: { totalAmount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect back to this page with success query params
        return_url: `${window.location.origin}/checkout?redirect_status=succeeded`
      }
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, the customer will be redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message ?? "An error occurred with your card details.");
    } else {
      setErrorMessage("An unexpected error occurred during confirmation.");
    }

    setIsProcessing(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <PaymentElement />

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600 animate-fadeIn">
          {errorMessage}
        </div>
      )}

      <button
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 px-4 font-semibold text-white shadow-lg transition duration-200 hover:bg-indigo-700 hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isProcessing || !stripe || !elements}
        type="submit"
      >
        <ShieldCheck className="h-5 w-5" />
        {isProcessing ? "Verifying and Securing..." : `Pay Securely ${formatCurrency(totalAmount)}`}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Fully encrypted 256-bit SSL transaction via Stripe</span>
      </div>
    </form>
  );
};

/**
 * Main Checkout page component
 */
export const CheckoutPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { items, getTotal, setCart, clearCart } = useCartStore();
  const total = getTotal();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Check for successful payment redirect status
  const redirectStatus = searchParams.get("redirect_status");
  const paymentIntentId = searchParams.get("payment_intent");
  const isSuccessRedirect = redirectStatus === "succeeded";

  // Query database cart
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
    enabled: !isSuccessRedirect // Don't query cart on success screen
  });

  // Sync cart items to zustand
  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data.items);
    }
  }, [cartQuery.data, setCart]);

  // Handle successful redirect cleanup
  useEffect(() => {
    if (isSuccessRedirect) {
      // Clean up cart store and backend database cart
      clearCart();
      cartApi.clear().catch((err) => console.error("Error clearing backend cart:", err));
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
    }
  }, [isSuccessRedirect, clearCart, queryClient]);

  // Initialize PaymentIntent on mount or when total changes
  useEffect(() => {
    if (items.length > 0 && !clientSecret && !isSuccessRedirect) {
      const initCheckout = async () => {
        try {
          setInitError(null);
          const payload = {
            amount: total,
            items: items.map((item) => ({
              productId: getProductId(item.product),
              quantity: item.quantity,
              price: item.product.price
            }))
          };
          const response = await paymentsApi.createIntent(payload);
          setClientSecret(response.clientSecret);
        } catch (err) {
          setInitError(getApiErrorMessage(err));
        }
      };
      initCheckout();
    }
  }, [items, total, clientSecret, isSuccessRedirect]);

  // If redirect success, show gorgeous success confirmation
  if (isSuccessRedirect) {
    return (
      <section className="container-page py-12 flex justify-center items-center min-h-[70vh]">
        <div className="card max-w-lg w-full p-8 text-center border-t-4 border-emerald-500 shadow-2xl rounded-2xl animate-scaleIn bg-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment Successful!</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Your transaction has been securely processed by Stripe. Your order is now registered and being prepared for shipment.
          </p>

          {paymentIntentId && (
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 text-left">
              <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 mb-2">
                <span className="font-semibold text-slate-500">Gateway Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Paid
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 break-all select-all">
                <span className="font-semibold text-slate-600 block text-xs uppercase mb-1">Stripe Payment Intent ID</span>
                {paymentIntentId}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition duration-200"
              to="/orders"
            >
              <ShoppingBag className="h-4 w-4" />
              View Your Orders
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-3 font-semibold text-slate-700 bg-white hover:bg-slate-50 transition duration-200"
              to="/"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // If cart is loading
  if (cartQuery.isLoading) {
    return <LoadingState label="Preparing checkout portal..." />;
  }

  // If no items in cart
  if (items.length === 0) {
    return (
      <section className="container-page py-12">
        <EmptyState
          message="Complete your shopping experience by placing items in the cart before checking out."
          title="Checkout Empty"
        />
      </section>
    );
  }

  return (
    <section className="container-page py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Checkout Details</h1>
        <p className="text-slate-500 mb-8">Secure MERN & Stripe Element demonstration flow.</p>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Payment Section */}
          <div className="space-y-6">
            <div className="card p-6 shadow-sm border border-slate-100 rounded-xl bg-white">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Secure Card Payment
              </h2>

              {initError && (
                <div className="mb-6 rounded-lg bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600">
                  {initError}
                </div>
              )}

              {!stripePromise ? (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
                  Stripe key is missing in your config. Set <strong>VITE_STRIPE_PUBLISHABLE_KEY</strong> in the environment.
                </div>
              ) : clientSecret ? (
                <Elements options={{ clientSecret, appearance: stripeAppearance }} stripe={stripePromise}>
                  <StripeCheckoutForm totalAmount={total} />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-sm font-medium text-slate-600">Creating verified payment intent...</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <aside className="space-y-6">
            <div className="card p-6 shadow-sm border border-slate-100 rounded-xl bg-white h-fit">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                Purchase Summary
              </h2>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div className="py-4 flex justify-between gap-4 text-sm" key={item.product._id}>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{item.product.title}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center text-base font-semibold text-slate-500 mb-3">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 mb-6">
                  <span>Delivery fee</span>
                  <span className="text-emerald-600 font-semibold uppercase text-xs rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                    Free
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-slate-900 border-t border-slate-100 pt-4">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
