import request from "supertest";
import { app } from "../app";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import bcrypt from "bcrypt";

jest.mock("../models/User", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  }
}));

describe("Auth Controller & Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "customer"
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123"
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toEqual({
        _id: "user123",
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "customer"
      });
      expect(response.body.token).toBeDefined();
    });

    it("should return 400 for invalid payload (e.g. invalid email)", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "not-an-email",
          password: "password123"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
    });

    it("should return 409 if email is already registered", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: "john@example.com" });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Email is already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        passwordHash: "$2b$12$hashedpasswordplaceholder"
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true));

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("john@example.com");
      expect(response.body.token).toBeDefined();
    });

    it("should fail to login with incorrect credentials", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        passwordHash: "$2b$12$hashedpasswordplaceholder"
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });
      jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false));

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "john@example.com",
          password: "wrongpassword"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should block request without token", async () => {
      const response = await request(app).get("/api/auth/me");
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication token is required");
    });

    it("should return user details with a valid token", async () => {
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
        role: "customer"
      };

      const testToken = jwt.sign({ userId: "user123", role: "customer" }, env.JWT_SECRET || "test-secret");
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe("user123");
    });
  });
});
