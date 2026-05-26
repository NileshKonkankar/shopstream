import request from "supertest";
import { app } from "../app";
import { Product } from "../models/Product";
import { stripe } from "../config/stripe";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

jest.mock("../models/Product", () => ({
  Product: {
    find: jest.fn(),
    updateOne: jest.fn()
  }
}));

jest.mock("../config/stripe", () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn()
    }
  }
}));

describe("Payment Controller & Routes", () => {
  const customerToken = jwt.sign({ userId: "cust123", role: "customer" }, env.JWT_SECRET || "test-secret");
  const validProductId = "65f1a5c68f123456789abcde";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/payments/create-intent", () => {
    it("should fail when token is not provided (unauthorized)", async () => {
      const response = await request(app)
        .post("/api/payments/create-intent")
        .send({
          items: [{ productId: "p1", quantity: 2 }]
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication token is required");
    });

    it("should successfully create a payment intent and return clientSecret", async () => {
      const mockProducts = [
        { _id: validProductId, title: "Canvas Backpack", price: 100, stock: 10, isActive: true }
      ];

      const mockStripeIntent = {
        id: "pi_123",
        client_secret: "pi_123_secret_mock",
        status: "requires_payment_method"
      };

      (Product.find as jest.Mock).mockResolvedValue(mockProducts);
      (stripe.paymentIntents.create as jest.Mock).mockResolvedValue(mockStripeIntent);

      const response = await request(app)
        .post("/api/payments/create-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          items: [{ productId: validProductId, quantity: 2 }]
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        clientSecret: "pi_123_secret_mock",
        amount: 200,
        currency: "inr",
        status: "requires_payment_method"
      });

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 20000, // 200 * 100 paise
        currency: "inr",
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: "cust123",
          items: JSON.stringify([{ productId: validProductId, quantity: 2 }])
        }
      });
    });

    it("should return 400 when items are missing in body", async () => {
      const response = await request(app)
        .post("/api/payments/create-intent")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
    });
  });
});
