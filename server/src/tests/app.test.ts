import request from "supertest";
import { app } from "../app";
import { Product } from "../models/Product";

jest.mock("../models/Product", () => ({
  Product: {
    find: jest.fn(),
    countDocuments: jest.fn()
  }
}));

describe("ShopStream API foundation", () => {
  it("health route works", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.uptimeSeconds).toEqual(expect.any(Number));
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("readiness route reports dependency state", async () => {
    const response = await request(app).get("/ready");

    expect([200, 503]).toContain(response.status);
    expect(response.body.status).toMatch(/ready|not_ready/);
    expect(response.body.dependencies.database.readyState).toEqual(expect.any(Number));
  });

  it("register user validation works", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "short"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.code).toBe("BAD_REQUEST");
    expect(response.body.requestId).toBeDefined();
  });

  it("product list route works", async () => {
    const sortMock = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      })
    });

    (Product.find as jest.Mock).mockReturnValue({ sort: sortMock });
    (Product.countDocuments as jest.Mock).mockResolvedValue(0);

    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.products).toEqual([]);
    expect(response.body.pagination.total).toBe(0);
    expect(Product.find).toHaveBeenCalledWith({ isActive: true });
  });
});
