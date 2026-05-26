import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../api/orders.api";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { formatCurrency } from "../../utils/formatters";

export const OrdersPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", "my"],
    queryFn: ordersApi.getMyOrders
  });

  return (
    <section className="container-page py-8">
      <h1 className="text-3xl font-bold text-slate-950">Orders</h1>
      <p className="mt-2 text-slate-600">Your recent purchase history.</p>

      <div className="mt-6">
        {isLoading && <LoadingState label="Loading orders" />}
        {isError && <ErrorState message="Orders could not be loaded." />}
        {!isLoading && !isError && data?.orders.length === 0 && (
          <EmptyState
            message="Completed checkouts will appear here."
            title="No orders yet"
          />
        )}
        <div className="grid gap-4">
          {data?.orders.map((order) => (
            <article className="card p-5" key={order._id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">Order {order._id}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "Recent order"}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-700">
                    {order.orderStatus}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                {order.items.map((item) => (
                  <div
                    className="flex items-center justify-between gap-4"
                    key={`${order._id}-${item.productId}`}
                  >
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
