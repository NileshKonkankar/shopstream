import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { MainLayout } from "../components/layout/MainLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { CartPage } from "../pages/cart/CartPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { OrdersPage } from "../pages/orders/OrdersPage";
import { ProductDetailsPage } from "../pages/products/ProductDetailsPage";
import { ProductsPage } from "../pages/products/ProductsPage";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route element={<HomePage />} index />
      <Route element={<ProductsPage />} path="products" />
      <Route element={<ProductDetailsPage />} path="products/:id" />
      <Route element={<LoginPage />} path="login" />
      <Route element={<RegisterPage />} path="register" />

      <Route element={<ProtectedRoute />}>
        <Route element={<CartPage />} path="cart" />
        <Route element={<CheckoutPage />} path="checkout" />
        <Route element={<OrdersPage />} path="orders" />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />} path="admin">
          <Route element={<AdminDashboardPage />} index />
          <Route element={<AdminProductsPage />} path="products" />
          <Route element={<AdminOrdersPage />} path="orders" />
        </Route>
      </Route>
    </Route>
  </Routes>
);
