import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../api/orders.api";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { formatCurrency } from "../../utils/formatters";

export const AdminOrdersPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", "admin"],
    queryFn: ordersApi.getAllOrders
  });

  if (isLoading) {
    return <LoadingState label="Loading orders" />;
  }

  if (isError) {
    return <ErrorState message="Admin orders could not be loaded." />;
  }

  if (!data?.orders.length) {
    return <EmptyState message="New customer orders will appear here." title="No orders" />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-950">All orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.orders.map((order) => (
              <tr key={order._id}>
                <td className="px-4 py-3 font-medium text-slate-950">{order._id}</td>
                <td className="px-4 py-3 text-slate-600">{order.items.length}</td>
                <td className="px-4 py-3 text-slate-600">{order.paymentStatus}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-700">
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-950">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
