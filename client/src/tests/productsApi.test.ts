import { productsApi } from "../api/products.api";
import { apiClient } from "../api/axios";

vi.mock("../api/axios", () => ({
  apiClient: {
    get: vi.fn()
  }
}));

describe("products API", () => {
  it("passes supported filters to the backend", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        products: []
      }
    });

    await productsApi.getProducts({
      search: "bag",
      category: "Bags",
      page: 2,
      limit: 12
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/products", {
      params: {
        search: "bag",
        category: "Bags",
        page: 2,
        limit: 12
      }
    });
  });
});
