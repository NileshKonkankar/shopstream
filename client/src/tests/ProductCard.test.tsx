import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { Product } from "../types";

const product: Product = {
  _id: "product-1",
  title: "Canvas Backpack",
  slug: "canvas-backpack",
  description: "A durable backpack for daily shopping and travel.",
  price: 89,
  category: "Bags",
  images: [],
  stock: 8,
  isActive: true
};

describe("ProductCard", () => {
  it("renders product information", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductCard product={product} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Canvas Backpack")).toBeInTheDocument();
    expect(screen.getByText("₹89.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeEnabled();
  });
});
