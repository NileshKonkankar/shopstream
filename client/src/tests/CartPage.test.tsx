import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { CartPage } from "../pages/cart/CartPage";
import { cartApi } from "../api/cart.api";
import { useCartStore } from "../store/cart.store";

vi.mock("../api/cart.api", () => ({
  cartApi: {
    getCart: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });

describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    vi.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    vi.mocked(cartApi.getCart).mockImplementation(() => new Promise(() => {}));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading cart/i)).toBeInTheDocument();
  });

  it("renders empty state when cart is empty", async () => {
    vi.mocked(cartApi.getCart).mockResolvedValue({ items: [] });
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
      expect(screen.getByText(/Add products to your cart to begin checkout/i)).toBeInTheDocument();
    });
  });

  it("renders cart items and summary successfully", async () => {
    const mockItem = {
      product: {
        _id: "product-1",
        title: "Canvas Backpack",
        slug: "canvas-backpack",
        description: "A durable backpack.",
        price: 89,
        category: "Bags",
        images: [],
        stock: 8,
        isActive: true
      },
      quantity: 2
    };

    vi.mocked(cartApi.getCart).mockResolvedValue({ items: [mockItem] });
    
    // Set Zustand store state to reflect the fetched item as well
    useCartStore.setState({
      items: [mockItem],
      stockWarnings: {},
      errorMessage: null
    });

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CartPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Canvas Backpack")).toBeInTheDocument();
      expect(screen.getByText("Order summary")).toBeInTheDocument();
      expect(screen.getAllByText("₹178.00").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("link", { name: /checkout/i })).toBeInTheDocument();
    });
  });
});
