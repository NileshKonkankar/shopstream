import request from "supertest";
import { app } from "../app";
import { Product } from "../models/Product";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

jest.mock("../models/Product", () => ({
  Product: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  }
}));

describe("Product Controller & Routes", () => {
  const validProductId = "65f1a5c68f123456789abcde";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("should return a list of active products with pagination", async () => {
      const mockProducts = [
        { _id: validProductId, title: "Product One", price: 100, isActive: true }
      ];

      const sortMock = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockProducts)
          })
        })
      });

      (Product.find as jest.Mock).mockReturnValue({ sort: sortMock });
      (Product.countDocuments as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body.products).toEqual(mockProducts);
      expect(response.body.pagination.total).toBe(1);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a product if it exists and is active", async () => {
      const mockProduct = { _id: validProductId, title: "Product One", price: 100, isActive: true };
      
      const leanMock = jest.fn().mockResolvedValue(mockProduct);
      (Product.findById as jest.Mock).mockReturnValue({ lean: leanMock });

      const response = await request(app).get(`/api/products/${validProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.product).toEqual(mockProduct);
    });

    it("should return 404 if product does not exist or is inactive", async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      (Product.findById as jest.Mock).mockReturnValue({ lean: leanMock });

      const response = await request(app).get(`/api/products/${validProductId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("POST /api/products", () => {
    it("should allow an admin to create a new product", async () => {
      const adminToken = jwt.sign({ userId: "admin123", role: "admin" }, env.JWT_SECRET || "test-secret");
      const mockProduct = {
        _id: validProductId,
        title: "New Product",
        slug: "new-product",
        description: "A cool new product",
        price: 250,
        category: "Bags",
        stock: 10,
        isActive: true
      };

      (Product.create as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "New Product",
          slug: "new-product",
          description: "A cool new product",
          price: 250,
          category: "Bags",
          stock: 10
        });

      expect(response.status).toBe(201);
      expect(response.body.product).toEqual(mockProduct);
    });

    it("should block non-admins from creating a product", async () => {
      const customerToken = jwt.sign({ userId: "cust123", role: "customer" }, env.JWT_SECRET || "test-secret");

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          title: "Unallowed Product",
          slug: "unallowed-product",
          description: "This should fail",
          price: 250,
          category: "Bags",
          stock: 10
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You do not have permission to access this resource");
    });
  });
});
