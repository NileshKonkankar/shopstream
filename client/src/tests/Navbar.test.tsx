import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useAuthStore } from "../store/auth.store";
import { useCartStore } from "../store/cart.store";

describe("Navbar", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useCartStore.getState().clearCart();
  });

  it("renders the ShopStream logo", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText("ShopStream")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });
});
