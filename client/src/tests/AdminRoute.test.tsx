import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminRoute } from "../routes/AdminRoute";
import { useAuthStore } from "../store/auth.store";

describe("AdminRoute", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("shows loading state when auth is not ready", () => {
    useAuthStore.setState({ isAuthReady: false });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route element={<p>Admin dashboard</p>} path="/admin/dashboard" />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Checking admin access/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useAuthStore.setState({ isAuthReady: true, isAuthenticated: false, user: null });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route element={<p>Admin dashboard</p>} path="/admin/dashboard" />
          </Route>
          <Route element={<p>Login page</p>} path="/login" />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects authenticated non-admin users to products page", () => {
    useAuthStore.setState({
      isAuthReady: true,
      isAuthenticated: true,
      user: {
        id: "user-1",
        name: "Regular User",
        email: "regular@example.com",
        role: "customer"
      }
    });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route element={<p>Admin dashboard</p>} path="/admin/dashboard" />
          </Route>
          <Route element={<p>Products page</p>} path="/products" />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Products page")).toBeInTheDocument();
  });

  it("renders children when the user is an admin", () => {
    useAuthStore.setState({
      isAuthReady: true,
      isAuthenticated: true,
      user: {
        id: "admin-1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin"
      }
    });

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route element={<p>Admin dashboard</p>} path="/admin/dashboard" />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
  });
});
