import { useQuery } from "@tanstack/react-query";
import { Boxes, ClipboardList, DollarSign, PackageX } from "lucide-react";
import { ordersApi } from "../../api/orders.api";
import { productsApi } from "../../api/products.api";
import { AdminStatCard } from "../../components/admin/AdminStatCard";
import { LoadingState } from "../../components/common/LoadingState";
import { formatCurrency } from "../../utils/formatters";

export const AdminDashboardPage = () => {
  const productsQuery = useQuery({
    queryKey: ["products", "admin-summary"],
    queryFn: () => productsApi.getProducts()
  });

  const ordersQuery = useQuery({
    queryKey: ["orders", "admin"],
    queryFn: ordersApi.getAllOrders
  });

  if (productsQuery.isLoading || ordersQuery.isLoading) {
    return <LoadingState label="Loading admin dashboard" />;
  }

  const products = productsQuery.data?.products ?? [];
  const orders = ordersQuery.data?.orders ?? [];
  const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const lowStockCount = products.filter((product) => product.stock <= 5).length;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon={Boxes} title="Total products" value={`${products.length}`} />
        <AdminStatCard icon={ClipboardList} title="Total orders" value={`${orders.length}`} />
        <AdminStatCard
          helper="TODO: Replace with paid-order revenue after payments are live."
          icon={DollarSign}
          title="Revenue"
          value={formatCurrency(revenue)}
        />
        <AdminStatCard
          helper="TODO: Add configurable inventory threshold."
          icon={PackageX}
          title="Low stock"
          value={`${lowStockCount}`}
        />
      </div>
    </div>
  );
};
