import { authApi } from "../api/auth.api";
import { apiClient } from "../api/axios";

vi.mock("../api/axios", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe("auth API", () => {
  it("normalizes backend token and _id fields", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        token: "jwt-token",
        user: {
          _id: "user-1",
          name: "Ada",
          email: "ada@example.com",
          role: "customer"
        }
      }
    });

    const response = await authApi.login({
      email: "ada@example.com",
      password: "password123"
    });

    expect(response.accessToken).toBe("jwt-token");
    expect(response.user.id).toBe("user-1");
  });
});
