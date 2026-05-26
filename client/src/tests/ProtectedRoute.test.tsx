import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { useAuthStore } from "../store/auth.store";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("redirects unauthenticated users to login", () => {
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<p>Cart page</p>} path="/cart" />
          </Route>
          <Route element={<p>Login page</p>} path="/login" />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
