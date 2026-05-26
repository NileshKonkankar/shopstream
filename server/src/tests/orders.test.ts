import request from "supertest";
import { app } from "../app";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

jest.mock("../models/Order", () => ({
  Order: {
    create: jest.fn()
  }
}));

jest.mock("../models/Product", () => ({
  Product: {
    find: jest.fn(),
    updateOne: jest.fn()
  }
}));

jest.mock("../sockets/inventory.socket", () => ({
  emitInventoryUpdate: jest.fn()
}));

describe("Order Controller & Routes", () => {
  const customerToken = jwt.sign({ userId: "cust123", role: "customer" }, env.JWT_SECRET || "test-secret");
  const validProductId = "65f1a5c68f123456789abcde";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/orders", () => {
    it("should successfully create a new pending order", async () => {
      const mockProducts = [
        { _id: validProductId, title: "Canvas Backpack", price: 89, stock: 10, isActive: true }
      ];

      const mockOrder = {
        _id: "65f1a5c68f123456789abcdf",
        userId: "cust123",
        items: [{ productId: validProductId, title: "Canvas Backpack", price: 89, quantity: 2 }],
        totalAmount: 178,
        paymentStatus: "pending",
        orderStatus: "pending"
      };

      (Product.find as jest.Mock).mockResolvedValue(mockProducts);
      (Product.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          items: [{ productId: validProductId, quantity: 2 }]
        });

      expect(response.status).toBe(201);
      expect(response.body.order).toEqual(mockOrder);
      expect(Product.updateOne).toHaveBeenCalledWith(
        {
          _id: validProductId,
          isActive: true,
          stock: { $gte: 2 }
        },
        {
          $inc: { stock: -2 }
        }
      );
    });

    it("should fail to create order if item quantity exceeds available stock", async () => {
      const mockProducts = [
        { _id: validProductId, title: "Canvas Backpack", price: 89, stock: 3, isActive: true }
      ];

      (Product.find as jest.Mock).mockResolvedValue(mockProducts);

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          items: [{ productId: validProductId, quantity: 5 }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Not enough stock for Canvas Backpack");
    });
  });
});
