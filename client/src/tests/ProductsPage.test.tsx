import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ProductsPage } from "../pages/products/ProductsPage";
import { productsApi } from "../api/products.api";

vi.mock("../api/products.api", () => ({
  productsApi: {
    getProducts: vi.fn()
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

describe("ProductsPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the loading state correctly", async () => {
    vi.mocked(productsApi.getProducts).mockImplementation(() => new Promise(() => {}));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("renders the error state when api fails", async () => {
    vi.mocked(productsApi.getProducts).mockRejectedValue(new Error("API Error"));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/products could not be loaded/i)).toBeInTheDocument();
    });
  });

  it("renders empty state when there are no products", async () => {
    vi.mocked(productsApi.getProducts).mockResolvedValue({
      products: [],
      pagination: {
        page: 1,
        limit: 24,
        total: 0,
        pages: 1
      }
    });
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      expect(screen.getByText(/Try clearing search filters/i)).toBeInTheDocument();
    });
  });

  it("renders list of products successfully", async () => {
    vi.mocked(productsApi.getProducts).mockResolvedValue({
      products: [
        {
          _id: "product-1",
          title: "Canvas Backpack",
          slug: "canvas-backpack",
          description: "A durable backpack.",
          price: 89,
          category: "Bags",
          images: [],
          stock: 8,
          isActive: true
        }
      ],
      pagination: {
        page: 1,
        limit: 24,
        total: 1,
        pages: 1
      }
    });
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProductsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Canvas Backpack")).toBeInTheDocument();
      expect(screen.getByText("₹89.00")).toBeInTheDocument();
    });
  });
});
