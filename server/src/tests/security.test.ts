import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app";
import { env } from "../config/env";

describe("Security hardening", () => {
  it("sets defensive headers and a request id", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });

  it("rejects mass assignment during registration", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Mallory",
        email: "mallory@example.com",
        password: "password123",
        role: "admin"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  it("rejects JWTs with invalid payload shape", async () => {
    const token = jwt.sign({ userId: "user123" }, env.JWT_SECRET);

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid authentication token payload");
  });
});
