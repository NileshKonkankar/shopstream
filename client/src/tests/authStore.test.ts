import { useAuthStore } from "../store/auth.store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("logs a user in and out", () => {
    useAuthStore.getState().login(
      {
        id: "user-1",
        name: "Demo User",
        email: "demo@example.com",
        role: "customer"
      },
      "token"
    );

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("token");

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
