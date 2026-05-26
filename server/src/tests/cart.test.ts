import request from "supertest";
import { app } from "../app";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

jest.mock("../models/Cart", () => ({
  Cart: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
  }
}));

jest.mock("../models/Product", () => ({
  Product: {
    findOne: jest.fn()
  }
}));

describe("Cart Controller & Routes", () => {
  const customerToken = jwt.sign({ userId: "cust123", role: "customer" }, env.JWT_SECRET || "test-secret");
  const validProductId = "65f1a5c68f123456789abcde";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/cart/items", () => {
    it("should successfully add an item to the cart", async () => {
      const mockProduct = { _id: validProductId, stock: 10, title: "Backpack", isActive: true };
      
      const mockCart = {
        userId: "cust123",
        items: [],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (Cart.findOneAndUpdate as jest.Mock).mockResolvedValue(mockCart);
      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          userId: "cust123",
          items: [{ productId: mockProduct, quantity: 2 }]
        })
      });

      const response = await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productId: validProductId, quantity: 2 });

      expect(response.status).toBe(201);
      expect(response.body.cart.items[0].quantity).toBe(2);
    });

    it("should fail to add an item if quantity exceeds available stock", async () => {
      const mockProduct = { _id: validProductId, stock: 5, title: "Backpack", isActive: true };
      const mockCart = {
        userId: "cust123",
        items: [{ productId: validProductId, quantity: 2 }],
        save: jest.fn()
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (Cart.findOneAndUpdate as jest.Mock).mockResolvedValue(mockCart);

      const response = await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ productId: validProductId, quantity: 4 }); // 2 existing + 4 next = 6 > 5 stock

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Not enough stock available");
    });
  });

  describe("PUT /api/cart/items/:productId", () => {
    it("should successfully update item quantity in cart", async () => {
      const mockProduct = { _id: validProductId, stock: 10, title: "Backpack", isActive: true };
      
      const mockCart = {
        userId: "cust123",
        items: [{ productId: validProductId, quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };

      // Both normal findOne and findOne populated should work
      (Cart.findOne as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue({
          userId: "cust123",
          items: [{ productId: mockProduct, quantity: 5 }]
        }),
        userId: "cust123",
        items: mockCart.items,
        save: mockCart.save
      }));
      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .put(`/api/cart/items/${validProductId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.cart.items[0].quantity).toBe(5);
    });
  });

  describe("DELETE /api/cart/items/:productId", () => {
    it("should successfully remove an item from the cart", async () => {
      const mockCart = {
        userId: "cust123",
        items: [{ productId: validProductId, quantity: 2 }],
        save: jest.fn().mockResolvedValue(true)
      };

      (Cart.findOne as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue({
          userId: "cust123",
          items: []
        }),
        userId: "cust123",
        items: mockCart.items,
        save: mockCart.save
      }));

      const response = await request(app)
        .delete(`/api/cart/items/${validProductId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toEqual([]);
    });
  });
});
